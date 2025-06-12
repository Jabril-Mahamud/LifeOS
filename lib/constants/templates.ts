// lib/constants/templates.ts

import { BuiltInTemplate } from '@/lib/types/templates';

// ============================================================================
// TEMPLATE CONTENT GENERATORS
// ============================================================================

const getCurrentDateString = () => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// ============================================================================
// TEMPLATE CONTENT
// ============================================================================

export const PRODUCTIVITY_TEMPLATE = `# Daily Focus - ${getCurrentDateString()}

## 🎯 Today's Priorities
- [ ] Priority 1: [Specific outcome expected]
- [ ] Priority 2: [Specific outcome expected]  
- [ ] Priority 3: [Specific outcome expected]

## ✅ Completed
**What I accomplished:**
- Finished [specific task/project]
- Made progress on [specific area]
- Resolved [specific issue]

**Key wins:** [1-2 notable achievements]

## 📊 Progress Check
**Project/Goal:** [Name]
- **Current status:** [Brief update]
- **Next milestone:** [Specific target]
- **Blockers:** [What's holding me back]

## 🧠 Learning & Insights
**Today I learned:**
- [Specific insight or skill gained]
- [Process improvement discovered]

**What worked well:**
- [Strategy/approach that was effective]

**What didn't work:**
- [Challenge faced and why it happened]

## 🔄 Tomorrow's Setup
**Top 3 priorities:**
1. [Specific action item]
2. [Specific action item]  
3. [Specific action item]

**Preparation needed:**
- [Resource/tool required]
- [Information to gather]
- [Person to contact]

## 📈 Weekly/Monthly View
**This week's focus:** [Main objective]
**This month's goal:** [Larger outcome]

---
**Energy level:** [1-10] | **Focus time:** [Hours of deep work]`;

export const SIMPLE_TEMPLATE = `# ${getCurrentDateString()}

## What happened today?


## How am I feeling?


## What did I learn?


## Tomorrow's focus:
`;

export const WORKOUT_TEMPLATE = `# ${getCurrentDateString()} - Fitness Log

## 🏃 Today's Workout
**Type:** [Cardio/Strength/Yoga/Rest Day]
**Duration:** [Time spent]
**Intensity:** [Light/Moderate/High]

### Exercises:
- [ ] Exercise 1 - [Sets x Reps or Duration]
- [ ] Exercise 2 - [Sets x Reps or Duration]
- [ ] Exercise 3 - [Sets x Reps or Duration]

## 💪 How I Felt
**Energy Level:** [1-10]
**Motivation:** [1-10]
**Physical feeling:** 

## 🥗 Nutrition Notes
**Water intake:** [Glasses/Liters]
**Meals:** 
- Breakfast: 
- Lunch: 
- Dinner: 
- Snacks: 

## 🎯 Tomorrow's Plan
**Planned activity:** 
**Focus area:** 
**Goal:** `;

export const WORK_TEMPLATE = `# ${getCurrentDateString()} - Work Journal

## 🎯 Today's Priorities
- [ ] [High priority task]
- [ ] [Medium priority task]
- [ ] [Low priority task]

## ✅ Completed Tasks
- [Task completed]
- [Another completed task]

## 💡 Key Insights & Learning
**What I learned:**

**Problem I solved:**

**Skills I developed:**

## 🤝 Meetings & Collaborations
**Important meetings:**
- Meeting 1: [Key outcomes]
- Meeting 2: [Action items]

**Team interactions:**

## 📊 Progress & Metrics
**Goals worked toward:**

**Metrics/Numbers:**

## 🔄 Tomorrow's Setup
**Top 3 priorities:**
1. 
2. 
3. 

**Preparation needed:**

## 💭 Reflection
**What went well:**

**What could improve:**

**Energy & mood:** [1-10]`;

// ============================================================================
// BUILT-IN TEMPLATES CONFIGURATION
// ============================================================================

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: 'daily',
    name: 'Daily Reflection',
    icon: '📋',
    description: 'Simple daily check-in',
    content: SIMPLE_TEMPLATE
  },
  {
    id: 'productivity',
    name: 'Productivity & Goals',
    icon: '🎯',
    description: 'Detailed planning and tracking',
    content: PRODUCTIVITY_TEMPLATE
  },
  {
    id: 'workout',
    name: 'Workout & Health',
    icon: '🏃',
    description: 'Fitness and wellness tracking',
    content: WORKOUT_TEMPLATE
  },
  {
    id: 'work',
    name: 'Work & Career',
    icon: '💼',
    description: 'Professional development',
    content: WORK_TEMPLATE
  }
];

// ============================================================================
// TEMPLATE UTILITIES
// ============================================================================

export const getTemplateById = (id: string): BuiltInTemplate | undefined => {
  return BUILT_IN_TEMPLATES.find(template => template.id === id);
};

export const getTemplateContent = (id: string): string => {
  const template = getTemplateById(id);
  return template?.content || '';
};

// Dynamic template generators (regenerate content with current date)
export const generateFreshTemplate = (id: string): string => {
  switch (id) {
    case 'daily':
      return `# ${getCurrentDateString()}

## What happened today?


## How am I feeling?


## What did I learn?


## Tomorrow's focus:
`;
    case 'productivity':
      return `# Daily Focus - ${getCurrentDateString()}

## 🎯 Today's Priorities
- [ ] Priority 1: [Specific outcome expected]
- [ ] Priority 2: [Specific outcome expected]  
- [ ] Priority 3: [Specific outcome expected]

## ✅ Completed
**What I accomplished:**
- Finished [specific task/project]
- Made progress on [specific area]
- Resolved [specific issue]

**Key wins:** [1-2 notable achievements]

## 📊 Progress Check
**Project/Goal:** [Name]
- **Current status:** [Brief update]
- **Next milestone:** [Specific target]
- **Blockers:** [What's holding me back]

## 🧠 Learning & Insights
**Today I learned:**
- [Specific insight or skill gained]
- [Process improvement discovered]

**What worked well:**
- [Strategy/approach that was effective]

**What didn't work:**
- [Challenge faced and why it happened]

## 🔄 Tomorrow's Setup
**Top 3 priorities:**
1. [Specific action item]
2. [Specific action item]  
3. [Specific action item]

**Preparation needed:**
- [Resource/tool required]
- [Information to gather]
- [Person to contact]

## 📈 Weekly/Monthly View
**This week's focus:** [Main objective]
**This month's goal:** [Larger outcome]

---
**Energy level:** [1-10] | **Focus time:** [Hours of deep work]`;
    case 'workout':
      return `# ${getCurrentDateString()} - Fitness Log

## 🏃 Today's Workout
**Type:** [Cardio/Strength/Yoga/Rest Day]
**Duration:** [Time spent]
**Intensity:** [Light/Moderate/High]

### Exercises:
- [ ] Exercise 1 - [Sets x Reps or Duration]
- [ ] Exercise 2 - [Sets x Reps or Duration]
- [ ] Exercise 3 - [Sets x Reps or Duration]

## 💪 How I Felt
**Energy Level:** [1-10]
**Motivation:** [1-10]
**Physical feeling:** 

## 🥗 Nutrition Notes
**Water intake:** [Glasses/Liters]
**Meals:** 
- Breakfast: 
- Lunch: 
- Dinner: 
- Snacks: 

## 🎯 Tomorrow's Plan
**Planned activity:** 
**Focus area:** 
**Goal:** `;
    case 'work':
      return `# ${getCurrentDateString()} - Work Journal

## 🎯 Today's Priorities
- [ ] [High priority task]
- [ ] [Medium priority task]
- [ ] [Low priority task]

## ✅ Completed Tasks
- [Task completed]
- [Another completed task]

## 💡 Key Insights & Learning
**What I learned:**

**Problem I solved:**

**Skills I developed:**

## 🤝 Meetings & Collaborations
**Important meetings:**
- Meeting 1: [Key outcomes]
- Meeting 2: [Action items]

**Team interactions:**

## 📊 Progress & Metrics
**Goals worked toward:**

**Metrics/Numbers:**

## 🔄 Tomorrow's Setup
**Top 3 priorities:**
1. 
2. 
3. 

**Preparation needed:**

## 💭 Reflection
**What went well:**

**What could improve:**

**Energy & mood:** [1-10]`;
    default:
      return getTemplateContent(id);
  }
};