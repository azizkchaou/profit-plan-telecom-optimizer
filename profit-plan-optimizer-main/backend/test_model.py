import unittest
from model import TelecomModel

class TestTelecomModel(unittest.TestCase):
    def setUp(self):
        self.forfaits = [
            {
                "id": "f1", "name": "Basic", "cost": 10, "dataGo": 10, 
                "demandA": 1000, "demandB": 10, "isActive": True
            },
            {
                "id": "f2", "name": "Pro", "cost": 20, "dataGo": 50, 
                "demandA": 800, "demandB": 8, "isActive": True
            }
        ]
        self.segments = [
            {
                "id": "s1", "name": "Students", "size": 1000, "elasticity": 1.5,
                "preferences": {"f1": 0.8, "f2": 0.2}
            }
        ]
        self.constraints = {
            "totalCapacity": 100000,
            "minMargin": 5
        }

    def test_optimization(self):
        model = TelecomModel(self.forfaits, self.segments, self.constraints)
        result = model.build_and_solve()
        
        self.assertTrue(result['success'])
        self.assertEqual(result['status'], "Optimal")
        
        prices = result['optimalPrices']
        self.assertTrue(prices['f1'] >= 10)
        self.assertTrue(prices['f2'] >= 20)
        
        # Check order constraint
        self.assertTrue(prices['f2'] >= prices['f1'] + 5)
        
        print(f"\nOptimization Result: {result['totalProfit']}")

if __name__ == '__main__':
    unittest.main()
