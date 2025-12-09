import gurobipy as gp
from gurobipy import GRB

class TelecomModel:
    def __init__(self, forfaits, segments, constraints):
        """
        Initialize the optimization model.
        
        :param forfaits: List of dictionaries containing plan details
        :param segments: List of dictionaries containing segment details
        :param constraints: Dictionary containing network constraints
        """
        self.forfaits = [f for f in forfaits if f.get('isActive', True)]
        self.segments = segments
        self.constraints = constraints
        self.model = None
        
    def build_and_solve(self):
        try:
            # Create a new model
            m = gp.Model("telecom_pricing")
            m.setParam('OutputFlag', 1)  # Enable verbose output for debugging
            # Use NonConvex=2 if the objective is non-convex (quadratic profit can be)
            m.setParam('NonConvex', 2)

            # Variables: Price for each plan
            prices = {}
            for f in self.forfaits:
                # Price must be at least the cost + 1 (to ensure some minimal viability)
                prices[f['id']] = m.addVar(
                    lb=f['cost'], 
                    ub=200.0, # Reasonable upper bound
                    vtype=GRB.CONTINUOUS, 
                    name=f"price_{f['id']}"
                )

            # Expressions for Demand
            # We calculate total demand per plan as a function of its price
            # q_f = Sum_s ( (a - b*p_f) * pref_sf * size_s/total_size * 1/elast_s )
            
            total_pop = sum(s['size'] for s in self.segments)
            projected_demands = {} # Map[f_id] -> LinExpr (demand function)
            
            for f in self.forfaits:
                total_demand_expr = 0
                for s in self.segments:
                    # Constants for this segment-plan pair
                    pref = s['preferences'].get(f['id'], 0.5)
                    share = s['size'] / total_pop if total_pop > 0 else 0
                    elast = s.get('elasticity', 1.0)
                    factor = pref * share * (1.0 / elast)
                    
                    # Demand function: (a - b * p)
                    # We assume demand cannot be negative, but in LP/QP we just use the line.
                    # To strictly enforce q >= 0, we can add constraints or rely on price bounds.
                    # Base demand: a - b * p
                    # Scaled: factor * (a - b * p) = factor*a - factor*b * p
                    
                    linear_term = factor * f['demandA']
                    coeff_p = - factor * f['demandB']
                    
                    segment_demand = linear_term + coeff_p * prices[f['id']]
                    total_demand_expr += segment_demand
                
                projected_demands[f['id']] = total_demand_expr

            # Constraints
            
            # 1. Network Capacity
            # Sum(demand_f * data_f) <= scale_factor * capacity
            # Note: Gurobi works better when numbers are well-scaled.
            total_usage_expr = 0
            for f in self.forfaits:
                total_usage_expr += projected_demands[f['id']] * f['dataGo']
                
            m.addConstr(total_usage_expr <= self.constraints['totalCapacity'], "Capacity")

            # 2. Price Ordering
            # Sort forfaits by data amount to determine order
            sorted_forfaits = sorted(self.forfaits, key=lambda x: x['dataGo'])
            min_margin = self.constraints.get('minMargin', 2.0)
            
            for i in range(1, len(sorted_forfaits)):
                prev = sorted_forfaits[i-1]
                curr = sorted_forfaits[i]
                # p_curr >= p_prev + margin
                m.addConstr(
                    prices[curr['id']] >= prices[prev['id']] + min_margin,
                    f"Order_{prev['id']}_{curr['id']}"
                )

            # Objective: Maximize Profit
            # Sum( (price - cost) * demand )
            profit_expr = 0
            for f in self.forfaits:
                p = prices[f['id']]
                c = f['cost']
                d = projected_demands[f['id']]
                
                # (p - c) * d = p*d - c*d
                # d is linear in p. So p*d is quadratic.
                profit_expr += (p - c) * d
                
            m.setObjective(profit_expr, GRB.MAXIMIZE)

            # Optimize
            m.optimize()

            if m.status in (GRB.OPTIMAL, GRB.SUBOPTIMAL):
                return self._format_results(m, prices, projected_demands)
            else:
                return {
                    "success": False,
                    "status": f"Optimization failed with status {m.status}"
                }

        except gp.GurobiError as e:
            return {
                "success": False,
                "status": f"Gurobi Error: {e.errno} - {e.message}"
            }
        except Exception as e:
            print(f"Internal Error: {e}")
            return {
                "success": False,
                "status": f"Internal Error: {str(e)}"
            }

    def _format_results(self, model, prices, demand_exprs):
        result_prices = {}
        result_demands = {}
        segment_allocation = {} # Re-calculate for verification
        profit_by_forfait = {}
        total_profit = 0
        total_usage = 0
        
        # Extract values
        for f in self.forfaits:
            p_val = prices[f['id']].X
            result_prices[f['id']] = p_val
            
            # Re-calculate exact demand numbers based on optimal price
            # We construct the breakdown again to be precise
            f_demand = 0
            
            for s in self.segments:
                pref = s['preferences'].get(f['id'], 0.5)
                share = s['size'] / sum(ss['size'] for ss in self.segments)
                elast = s.get('elasticity', 1.0)
                factor = pref * share * (1.0 / elast)
                
                base_demand = f['demandA'] - f['demandB'] * p_val
                # Ensure non-negative demand per segment for reporting
                seg_d = max(0, factor * base_demand)
                
                if s['id'] not in segment_allocation:
                    segment_allocation[s['id']] = {}
                segment_allocation[s['id']][f['id']] = seg_d
                f_demand += seg_d

            result_demands[f['id']] = f_demand
            
            denom = (p_val - f['cost']) * f_demand
            profit_by_forfait[f['id']] = denom
            total_profit += denom
            
            total_usage += f_demand * f['dataGo']

        params = {k: getattr(model.Params, k) for k in ["Iterations", "Runtime"] if hasattr(model.Params, k)}

        return {
            "success": True,
            "status": "Optimal",
            "optimalPrices": result_prices,
            "demands": result_demands,
            "segmentAllocation": segment_allocation,
            "totalProfit": total_profit,
            "profitByForfait": profit_by_forfait,
            "networkUsage": total_usage,
            "networkUtilization": (total_usage / self.constraints['totalCapacity']) * 100,
            "iterations": int(getattr(model, "IterCount", 0)),
            "executionTime": model.Runtime * 1000 # ms
        }
