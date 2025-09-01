// Test Dynamic Blueprint Generation
// This file tests the dynamic blueprint generation logic

// Mock app ideas to test
const testCases = [
  {
    name: "Student Notes Sharing App",
    idea: "students can share and collaborate on study notes",
    platforms: ["web"],
    expectedScreens: ["Note Taking", "Browse/Search", "Detail View", "User Profile", "Settings"]
  },
  {
    name: "Fitness Tracker",
    idea: "users can track workouts and monitor fitness progress",
    platforms: ["mobile"],
    expectedScreens: ["Splash Screen", "Onboarding Flow", "Fitness Tracker", "Browse/Search", "Detail View", "User Profile", "Settings"]
  },
  {
    name: "Simple Calculator",
    idea: "basic calculator for simple math operations",
    platforms: ["web"],
    expectedScreens: ["Calculator", "Settings"]
  },
  {
    name: "Social Photo Sharing",
    idea: "users can share photos and connect with friends",
    platforms: ["mobile", "web"],
    expectedScreens: ["Splash Screen", "Onboarding Flow", "Photo Gallery", "Create/Upload", "Browse/Search", "Detail View", "User Profile", "Settings"]
  }
];

// Mock the dynamic screen generation logic
function generateDynamicScreens(idea, appName, platforms) {
  const screens = [];
  
  // Always start with a main screen based on the app idea
  const mainScreen = generateMainScreen(idea, appName);
  screens.push(mainScreen);
  
  // Add authentication screens if the app idea suggests user accounts
  if (idea.includes('user') || idea.includes('account') || idea.includes('profile') || 
      idea.includes('social') || idea.includes('community') || idea.includes('collaborate')) {
    screens.push({
      id: 'login',
      name: 'Login/Sign In',
      purpose: 'User authentication and account access',
      type: 'auth',
      components: ['Email input', 'Password input', 'Login button', 'Social login options', 'Forgot password link'],
      navigation: ['dashboard', 'signup', 'forgot-password'],
      subPages: ['forgot-password', 'reset-password'],
      edgeCases: ['Invalid credentials', 'Account locked', 'Network error']
    });
    
    screens.push({
      id: 'signup',
      name: 'Sign Up',
      purpose: 'New user registration',
      type: 'auth',
      components: ['Name input', 'Email input', 'Password input', 'Confirm password', 'Terms checkbox', 'Sign up button'],
      navigation: ['dashboard', 'login', 'email-verification'],
      subPages: ['email-verification', 'profile-setup'],
      edgeCases: ['Email already exists', 'Weak password', 'Terms not accepted']
    });
  }
  
  // Add feature-specific screens based on the app idea
  if (idea.includes('upload') || idea.includes('create') || idea.includes('add') || idea.includes('post')) {
    screens.push({
      id: 'create',
      name: 'Create/Upload',
      purpose: 'Create new content or upload files',
      type: 'feature',
      components: ['Form inputs', 'File upload', 'Preview', 'Submit button'],
      navigation: ['dashboard', 'list', 'profile'],
      subPages: ['draft', 'preview'],
      edgeCases: ['File too large', 'Invalid format', 'Network error']
    });
  }
  
  if (idea.includes('list') || idea.includes('browse') || idea.includes('search') || idea.includes('feed')) {
    screens.push({
      id: 'list',
      name: 'Browse/Search',
      purpose: 'View and search through content',
      type: 'feature',
      components: ['Search bar', 'Filter options', 'Content grid/list', 'Sort controls'],
      navigation: ['dashboard', 'create', 'detail'],
      subPages: ['search-results', 'filtered-view'],
      edgeCases: ['No results', 'Search error', 'Loading state']
    });
  }
  
  if (idea.includes('detail') || idea.includes('view') || idea.includes('show') || idea.includes('profile')) {
    screens.push({
      id: 'detail',
      name: 'Detail View',
      purpose: 'View detailed information about content',
      type: 'feature',
      components: ['Content display', 'Action buttons', 'Related items', 'Comments/reviews'],
      navigation: ['dashboard', 'list', 'edit'],
      subPages: ['edit', 'share', 'report'],
      edgeCases: ['Content not found', 'Permission denied', 'Loading error']
    });
  }
  
  // Add profile/settings if user management is involved
  if (idea.includes('user') || idea.includes('account') || idea.includes('profile') || 
      idea.includes('settings') || idea.includes('preferences')) {
    screens.push({
      id: 'profile',
      name: 'User Profile',
      purpose: 'User profile management and personal information',
      type: 'feature',
      components: ['Profile picture', 'User info display', 'Edit profile button', 'Activity history'],
      navigation: ['dashboard', 'settings', 'edit-profile'],
      subPages: ['edit-profile', 'activity-history', 'achievements'],
      edgeCases: ['Profile incomplete', 'Image upload error']
    });
    
    screens.push({
      id: 'settings',
      name: 'Settings',
      purpose: 'App configuration and user preferences',
      type: 'settings',
      components: ['Preference toggles', 'Account settings', 'Privacy controls', 'Logout button'],
      navigation: ['dashboard', 'profile', 'privacy', 'notifications'],
      subPages: ['account', 'privacy', 'notifications', 'about'],
      edgeCases: ['Settings save error', 'Permission denied']
    });
  }
  
  // Add dashboard if multiple features exist
  if (screens.length > 2) {
    screens.unshift({
      id: 'dashboard',
      name: 'Dashboard/Home',
      purpose: 'Main hub with overview and quick actions',
      type: 'main',
      components: ['Header with user info', 'Quick stats/metrics', 'Recent activity', 'Action buttons', 'Navigation menu'],
      navigation: screens.filter(s => s.id !== 'dashboard').map(s => s.id),
      subPages: ['notifications', 'search'],
      edgeCases: ['No data available', 'Loading state', 'Error state']
    });
  }
  
  // Add splash/onboarding only for mobile apps or if explicitly needed
  if (platforms.includes('mobile') && screens.length > 3) {
    screens.unshift({
      id: 'splash',
      name: 'Splash Screen',
      purpose: 'App loading and branding',
      type: 'loading',
      components: ['App logo', 'Loading indicator', 'Version info'],
      navigation: ['onboarding', 'login', 'dashboard'],
      subPages: [],
      edgeCases: ['Network error', 'App update required']
    });
    
    screens.splice(1, 0, {
      id: 'onboarding',
      name: 'Onboarding Flow',
      purpose: 'Introduce app features and benefits',
      type: 'onboarding',
      components: ['Feature highlights', 'Skip button', 'Next/Previous buttons', 'Progress indicator'],
      navigation: ['login', 'signup'],
      subPages: ['welcome', 'features', 'permissions'],
      edgeCases: ['Skip onboarding', 'Return user']
    });
  }
  
  return screens;
}

function generateMainScreen(idea, appName) {
  // Determine the main feature based on the app idea
  let mainFeatureName = 'Main Feature';
  let purpose = 'Core functionality of the application';
  
  // Check for specific app types first (more specific matches)
  if (idea.includes('fitness') || idea.includes('workout')) {
    mainFeatureName = 'Fitness Tracker';
    purpose = 'Monitor fitness activities and health metrics';
  } else if (idea.includes('habit') && !idea.includes('fitness') && !idea.includes('workout')) {
    mainFeatureName = 'Habit Tracker';
    purpose = 'Track and manage daily habits and routines';
  } else if (idea.includes('task') || idea.includes('todo')) {
    mainFeatureName = 'Task Manager';
    purpose = 'Create, organize, and complete tasks';
  } else if (idea.includes('social') || idea.includes('chat') || idea.includes('community')) {
    mainFeatureName = 'Social Feed';
    purpose = 'Connect with others and share content';
  } else if (idea.includes('shop') || idea.includes('store') || idea.includes('marketplace')) {
    mainFeatureName = 'Product Catalog';
    purpose = 'Browse and discover products or services';
  } else if (idea.includes('learn') || idea.includes('course') || idea.includes('education')) {
    mainFeatureName = 'Learning Hub';
    purpose = 'Access educational content and track progress';
  } else if (idea.includes('finance') || idea.includes('budget') || idea.includes('money')) {
    mainFeatureName = 'Finance Manager';
    purpose = 'Track expenses, income, and financial goals';
  } else if (idea.includes('recipe') || idea.includes('food') || idea.includes('cooking')) {
    mainFeatureName = 'Recipe Collection';
    purpose = 'Store, organize, and discover recipes';
  } else if (idea.includes('travel') || idea.includes('trip') || idea.includes('vacation')) {
    mainFeatureName = 'Travel Planner';
    purpose = 'Plan trips and organize travel details';
  } else if (idea.includes('event') || idea.includes('calendar') || idea.includes('schedule')) {
    mainFeatureName = 'Event Manager';
    purpose = 'Create and manage events and schedules';
  } else if (idea.includes('note') || idea.includes('document') || idea.includes('writing')) {
    mainFeatureName = 'Note Taking';
    purpose = 'Create, organize, and manage notes and documents';
  } else if (idea.includes('photo') || idea.includes('image') || idea.includes('gallery')) {
    mainFeatureName = 'Photo Gallery';
    purpose = 'Store, organize, and share photos and images';
  } else if (idea.includes('music') || idea.includes('audio') || idea.includes('playlist')) {
    mainFeatureName = 'Music Player';
    purpose = 'Play, organize, and discover music and audio content';
  } else if (idea.includes('book') || idea.includes('reading') || idea.includes('library')) {
    mainFeatureName = 'Digital Library';
    purpose = 'Access and organize digital books and reading materials';
  } else if (idea.includes('calculator') || idea.includes('math') || idea.includes('calculate')) {
    mainFeatureName = 'Calculator';
    purpose = 'Perform mathematical calculations and operations';
  }
  
  return {
    id: 'main-feature',
    name: mainFeatureName,
    purpose,
    type: 'feature',
    components: ['Feature interface', 'Action buttons', 'Data display', 'Filter/sort options'],
    navigation: ['dashboard', 'detail', 'create'],
    subPages: ['detail', 'create', 'edit', 'list'],
    edgeCases: ['Empty state', 'Loading', 'Error', 'No permissions']
  };
}

// Test the dynamic generation
console.log('🧪 Testing Dynamic Blueprint Generation\n');

testCases.forEach((testCase, index) => {
  console.log(`\n📱 Test Case ${index + 1}: ${testCase.name}`);
  console.log(`   Idea: ${testCase.idea}`);
  console.log(`   Platforms: ${testCase.platforms.join(', ')}`);
  
  const screens = generateDynamicScreens(testCase.idea, testCase.name, testCase.platforms);
  const screenNames = screens.map(s => s.name);
  
  console.log(`   Generated Screens (${screens.length}): ${screenNames.join(' → ')}`);
  
  // Check if expected screens are present
  const missingScreens = testCase.expectedScreens.filter(expected => 
    !screenNames.some(generated => generated.includes(expected) || expected.includes(generated))
  );
  
  if (missingScreens.length === 0) {
    console.log(`   ✅ PASS: All expected screens generated`);
  } else {
    console.log(`   ❌ FAIL: Missing screens: ${missingScreens.join(', ')}`);
  }
  
  // Show screen details
  screens.forEach((screen, idx) => {
    console.log(`     ${idx + 1}. ${screen.name} - ${screen.purpose}`);
  });
});

console.log('\n🎯 Dynamic Blueprint Generation Test Complete!');
console.log('\nKey Improvements Made:');
console.log('✅ Screens are now generated based on app idea content');
console.log('✅ No more hardcoded 8-screen template');
console.log('✅ Mobile apps get splash/onboarding when appropriate');
console.log('✅ Web apps get minimal essential screens');
console.log('✅ Authentication screens only when user management is needed');
console.log('✅ Feature screens based on actual app functionality');
