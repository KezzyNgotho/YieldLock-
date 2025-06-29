// functions/strategyAI.js
// AI-powered DeFi strategy recommendation engine

// Parse input parameters
const args = Functions.decodeString(args[0]);
const [vaultId, goalName, amount, targetAmount, duration, userRiskProfile] = args.split('|');

// Strategy database with real DeFi protocols
const strategies = {
  conservative: [
    {
      name: "Ultra Safe",
      description: "Maximum safety with stable yields",
      allocation: {
        aave: 80,
        compound: 20,
        gmx: 0,
        riskLevel: 1
      },
      expectedAPY: 3.5
    },
    {
      name: "Balanced Conservative", 
      description: "Good balance of safety and yield",
      allocation: {
        aave: 60,
        compound: 30,
        gmx: 10,
        riskLevel: 2
      },
      expectedAPY: 5.2
    }
  ],
  moderate: [
    {
      name: "Growth Focused",
      description: "Optimized for steady growth",
      allocation: {
        aave: 40,
        compound: 40,
        gmx: 20,
        riskLevel: 3
      },
      expectedAPY: 7.8
    },
    {
      name: "Yield Maximizer",
      description: "Higher yield with managed risk",
      allocation: {
        aave: 30,
        compound: 30,
        gmx: 40,
        riskLevel: 4
      },
      expectedAPY: 12.5
    }
  ],
  aggressive: [
    {
      name: "High Growth",
      description: "Maximum yield potential",
      allocation: {
        aave: 20,
        compound: 20,
        gmx: 60,
        riskLevel: 5
      },
      expectedAPY: 18.2
    }
  ]
};

// AI decision logic
function recommendStrategy(goalName, amount, targetAmount, duration, userRiskProfile) {
  const amountNum = parseFloat(amount);
  const targetNum = parseFloat(targetAmount);
  const durationDays = parseFloat(duration);
  
  // Calculate required APY to reach goal
  const requiredAPY = calculateRequiredAPY(amountNum, targetNum, durationDays);
  
  // Determine risk profile based on goal characteristics
  let riskCategory = userRiskProfile || 'moderate';
  
  // Adjust risk based on goal type
  if (goalName.toLowerCase().includes('rent') || goalName.toLowerCase().includes('emergency')) {
    riskCategory = 'conservative';
  } else if (goalName.toLowerCase().includes('vacation') || goalName.toLowerCase().includes('luxury')) {
    riskCategory = 'aggressive';
  }
  
  // Adjust risk based on amount and timeframe
  if (amountNum > 10000 || durationDays < 30) {
    riskCategory = 'conservative';
  } else if (amountNum < 1000 && durationDays > 180) {
    riskCategory = 'aggressive';
  }
  
  // Select strategy pool
  const strategyPool = strategies[riskCategory];
  
  // Choose best strategy based on required APY
  let selectedStrategy = strategyPool[0];
  
  for (const strategy of strategyPool) {
    if (strategy.expectedAPY >= requiredAPY) {
      selectedStrategy = strategy;
      break;
    }
  }
  
  // Add goal-specific recommendations
  const recommendation = {
    vaultId: vaultId,
    strategy: selectedStrategy.name,
    allocation: selectedStrategy.allocation,
    expectedAPY: selectedStrategy.expectedAPY,
    riskLevel: selectedStrategy.riskLevel,
    reasoning: generateReasoning(goalName, selectedStrategy, requiredAPY)
  };
  
  return recommendation;
}

function calculateRequiredAPY(initial, target, days) {
  if (initial >= target) return 0;
  
  const years = days / 365;
  const requiredAPY = ((target / initial) ** (1 / years) - 1) * 100;
  
  return Math.max(0, requiredAPY);
}

function generateReasoning(goalName, strategy, requiredAPY) {
  const reasons = [];
  
  if (strategy.expectedAPY >= requiredAPY) {
    reasons.push(`Strategy expected to meet your ${goalName} goal`);
  } else {
    reasons.push(`Strategy may need adjustment to reach ${goalName} goal`);
  }
  
  if (strategy.riskLevel <= 2) {
    reasons.push("Low-risk strategy for capital preservation");
  } else if (strategy.riskLevel <= 4) {
    reasons.push("Balanced approach for growth and safety");
  } else {
    reasons.push("High-yield strategy for maximum growth");
  }
  
  return reasons.join(". ");
}

// Execute recommendation
const recommendation = recommendStrategy(goalName, amount, targetAmount, duration, userRiskProfile);

// Return encoded result for smart contract
const result = {
  vaultId: parseInt(vaultId),
  strategy: recommendation.strategy,
  allocation: recommendation.allocation,
  expectedAPY: recommendation.expectedAPY,
  reasoning: recommendation.reasoning
};

return Functions.encodeString(JSON.stringify(result));
  