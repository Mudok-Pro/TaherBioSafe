
// src/lib/translations.ts
import type { Language } from '@/types';

export type TranslationKey =
  | 'appName'
  | 'navHome'
  | 'navServices'
  | 'navAboutUs'
  | 'loginButton'
  | 'logoutButton'
  | 'accountSettingsNav'
  | 'dashboardNavLabel'
  | 'myContractsNavLabel'
  | 'requestNewContractNavLabel'
  | 'orderPickupNavLabel'
  | 'userManagementNavLabel'
  | 'contractManagementNavLabel'
  | 'pickupLogisticsNavLabel'
  | 'incinerationReportsNavLabel'
  | 'statisticsNavLabel'
  | 'myScheduleNavLabel'
  | 'settingsNavLabel'
  | 'overviewGroupLabel'
  | 'customerPortalGroupLabel'
  | 'administrationGroupLabel'
  | 'operationsGroupLabel'
  | 'analyticsGroupLabel'
  | 'driverPortalGroupLabel'
  | 'generalGroupLabel'
  | 'manageWasteIncineration'
  | 'safeResponsibleWasteManagement'
  | 'trustedPartnerSecureWaste'
  | 'exploreOurServicesButton'
  | 'learnMoreAboutUsButton'
  | 'aboutAppName'
  | 'committedToSafeWaste'
  | 'ourServicesTitle'
  | 'comprehensiveWasteManagement'
  | 'copyright'
  | 'privacyPolicy'
  | 'termsOfService'
  | 'welcomeToAppNameDashboard'
  | 'loadingAppName'
  | 'keyFeaturesBadge'
  | 'whyChooseUsTitle'
  | 'whyChooseUsDesc'
  | 'comprehensiveServicesTitle'
  | 'comprehensiveServicesDesc'
  | 'complianceFocusedTitle'
  | 'complianceFocusedDesc'
  | 'reliablePickupsTitle'
  | 'reliablePickupsDesc'
  | 'readyForSecureWasteManagementTitle'
  | 'readyForSecureWasteManagementDesc'
  | 'clientLoginRequestServiceButton'
  | 'newClientNote'
  | 'ourMission'
  | 'ourMissionDesc'
  | 'ourValues'
  | 'valueSafetyFirst'
  | 'valueCompliance'
  | 'valueReliability'
  | 'valueIntegrity'
  | 'valueResponsibility'
  | 'ourStory'
  | 'ourStoryDesc1'
  | 'ourStoryDesc2'
  | 'meetOurTeam'
  | 'teamMemberPlaceholder'
  | 'roleTitlePlaceholder'
  | 'dedicatedTeamSupport'
  | 'servicesWasteTypesTitle'
  | 'servicesServiceTiersTitle'
  | 'servicesPaymentOptionsTitleAlgeria'
  | 'servicesPaymentOptionsDescAlgeria'
  | 'paymentPaysera'
  | 'paymentPayseraDesc'
  | 'paymentCIB'
  | 'paymentCIBDesc'
  | 'paymentEldahabia'
  | 'paymentEldahabiaDesc'
  | 'paymentConfirmNote'
  | 'contactTierDiscussion'
  | 'serviceTierFeature1'
  | 'serviceTierFeature2'
  | 'serviceTierPremiumSupport'
  | 'formLabelEmail'
  | 'formPlaceholderEmail'
  | 'formLabelPassword'
  | 'formLabelRole'
  | 'formPlaceholderRole'
  | 'formDescRole'
  | 'loginRoleSelectionDesc'
  | 'formLabelTier'
  | 'formPlaceholderTier'
  | 'loginSuccessTitle'
  | 'loginSuccessDesc'
  | 'loginErrorTitle'
  | 'loginErrorInvalidCredential'
  | 'loginErrorTooManyRequests'
  | 'loginErrorDefault'
  | 'loginButtonLoading'
  | 'formLabelName'
  | 'formPlaceholderName'
  | 'formDescName'
  // Admin Pages
  | 'adminReportsTitle'
  | 'adminReportsDesc'
  | 'reportSummarizerCardTitle'
  | 'reportSummarizerCardDesc'
  | 'reportSummarizerTextareaPlaceholder'
  | 'reportSummarizerButton'
  | 'reportSummarizerButtonLoading'
  | 'reportSummarizerErrorTitle'
  | 'reportSummarizerResultTitle'
  | 'reportSummarizerResultDesc'
  | 'reportSummarizerSummaryLabel'
  | 'reportSummarizerCategoriesLabel'
  | 'reportSummarizerKeyMetricsLabel'
  | 'reportSummarizedSuccessTitle'
  | 'reportSummarizedSuccessDesc'
  | 'userManagementTitle'
  | 'userManagementDesc'
  | 'userManagementAddButton'
  | 'userManagementDialogTitleAdd'
  | 'userManagementDialogTitleEdit'
  | 'userManagementDialogDescAdd'
  | 'userManagementDialogDescEdit'
  | 'userFormFullNameLabel'
  | 'userFormFullNamePlaceholder'
  | 'userFormEmailLabel'
  | 'userFormEmailPlaceholder'
  | 'userFormPasswordLabel'
  | 'userFormPasswordPlaceholder'
  | 'userFormPasswordDesc'
  | 'userFormRoleLabel'
  | 'userFormRolePlaceholder'
  | 'userFormTierLabel'
  | 'userFormTierPlaceholder'
  | 'userFormCancelButton'
  | 'userFormSubmitButtonEdit'
  | 'userFormSubmitButtonAdd'
  | 'userDeletedToastTitle'
  | 'userDeletedToastDesc'
  | 'userUpdatedToastTitle'
  | 'userUpdatedToastDesc'
  | 'userAddedToastTitle'
  | 'userAddedToastDesc'
  | 'userTableHeadUser'
  | 'userTableHeadEmail'
  | 'userTableHeadRole'
  | 'userTableHeadTier'
  | 'userTableHeadActions'
  | 'userTableActionEdit'
  | 'userTableActionChangeRole'
  | 'userTableActionDelete'
  | 'userManagementNoPermissionError'
  | 'userManagementFetchErrorAdminStrict'
  | 'userManagementFetchErrorTitle'
  | 'userNotLoggedInError'
  | 'userManagementActionErrorTitle'
  | 'userManagementCannotDeleteOwnerError'
  | 'userManagementCannotDeleteSelfAsOwnerError'
  | 'userManagementDeleteErrorTitle'
  | 'userManagementSaveErrorTitle'
  | 'userManagementNoUsersFound'
  | 'userManagementNoUsersFirestoreCheck'
  | 'userManagementPermissionErrorAdminCustomClaim'
  | 'userManagementLoadingUsers'
  | 'userTableActionOpenMenu'
  | 'pickupLogisticsTitle'
  | 'pickupLogisticsDesc'
  | 'pickupTableHeadId'
  | 'pickupTableHeadCustomer'
  | 'pickupTableHeadWasteType'
  | 'pickupTableHeadPreferredDate'
  | 'pickupTableHeadStatus'
  | 'pickupTableHeadDriver'
  | 'pickupTableHeadActions'
  | 'pickupTableAssignDriverPlaceholder'
  | 'pickupTableActionViewDetails'
  | 'pickupTableActionSchedule'
  | 'pickupTableActionMarkCompleted'
  | 'pickupTableActionCancel'
  | 'pickupTableActionDelete'
  | 'noPickupsFound'
  | 'pickupManagementNoPermissionError'
  | 'pickupManagementFetchError'
  | 'pickupManagementFetchErrorTitle'
  | 'pickupManagementActionErrorTitle'
  | 'pickupManagementUpdateErrorTitle'
  | 'pickupManagementErrorPrefix'
  | 'pickupDriverAssignedTitle'
  | 'pickupDriverAssignedDesc'
  | 'pickupStatusUpdatedTitle'
  | 'pickupStatusUpdatedDesc'
  | 'pickupManagementLoadingPickups'
  | 'pickupManagementNoPickupsFirestoreCheck'
  | 'unassignedLabel'
  | 'noDriversFound'
  | 'contractManagementTitle'
  | 'contractManagementDesc'
  | 'contractTableTabAll'
  | 'contractTableTabPending'
  | 'contractTableTabAwaitingSignatures'
  | 'contractTableTabActive'
  | 'contractTableTabExpired'
  | 'contractTableTabArchived'
  | 'contractTableNoContractsInCategory'
  | 'contractTableHeadId'
  | 'contractTableHeadCustomer'
  | 'contractTableHeadTier'
  | 'contractTableHeadStatus'
  | 'contractTableHeadRequested'
  | 'contractTableHeadActions'
  | 'contractTableActionViewDetails'
  | 'contractTableActionEdit'
  | 'contractTableActionApprove'
  | 'contractTableActionMarkSigned'
  | 'contractTableActionArchive'
  | 'contractTableActionDelete'
  | 'contractApprovedToastTitle'
  | 'contractApprovedToastDesc'
  | 'contractActivatedToastTitle'
  | 'contractActivatedToastDesc'
  | 'contractArchivedToastTitle'
  | 'contractArchivedToastDesc'
  | 'contractManagementPermissionErrorAdminStrict'
  | 'contractManagementFetchErrorAdminStrict'
  | 'contractManagementFetchErrorTitle'
  | 'contractManagementUpdateErrorTitle'
  | 'contractManagementActionErrorTitle'
  | 'contractManagementNoContractsFirestoreCheckStrict'
  | 'contractManagementLoadingContracts'
  | 'contractManagementErrorPrefix'
  | 'contractTableActionOpenMenu'
  | 'errorDialogTitle'
  | 'unknownStatus'
  | 'statisticsTitle'
  | 'statisticsDesc'
  | 'statsTotalActiveUsers'
  | 'statsActiveContracts'
  | 'statsPickupsThisMonth'
  | 'statsReportsSummarized'
  | 'statsMonthlyContractGrowth'
  | 'statsPickupVolumeTrends'
  | 'statsChartPlaceholderContracts'
  | 'statsChartPlaceholderPickups'
  | 'statsUsersChange'
  | 'statsContractsChange'
  | 'statsPickupsChange'
  | 'statsReportsInsight'
  // Customer Pages
  | 'customerMyContractsTitle'
  | 'customerMyContractsDesc'
  | 'customerRequestNewContractButton'
  | 'customerNoContractsMessage'
  | 'customerRequestFirstContractButton'
  | 'customerContractTableHeadService'
  | 'customerContractTableHeadEffectiveDate'
  | 'customerContractTableActionView'
  | 'customerContractTableActionDownload'
  | 'customerContractTableActionRenew'
  | 'customerContractsFooterShowing'
  | 'customerFetchError'
  | 'customerRequestContractTitle'
  | 'customerRequestContractDesc'
  | 'contractFormCompanyNameLabel'
  | 'contractFormCompanyNamePlaceholder'
  | 'contractFormContactPersonLabel'
  | 'contractFormContactPersonPlaceholder'
  | 'contractFormEmailLabel'
  | 'contractFormEmailPlaceholder'
  | 'contractFormPhoneLabel'
  | 'contractFormPhonePlaceholder'
  | 'contractFormServiceDescLabel'
  | 'contractFormServiceDescPlaceholder'
  | 'contractFormServiceDescHelper'
  | 'contractFormTierLabel'
  | 'contractFormTierPlaceholder'
  | 'contractFormSignatureLabel'
  | 'contractFormSignaturePlaceholder'
  | 'contractFormSignatureDesc'
  | 'contractFormAgreeToTermsLabel'
  | 'contractFormSubmitButton'
  | 'contractFormSubmittingButton'
  | 'contractRequestSubmittedToastTitle'
  | 'contractRequestSubmittedToastDesc'
  | 'contractRequestSubmitErrorTitle'
  | 'orderPickupTitle'
  | 'orderPickupDesc'
  | 'pickupFormWasteTypeLabel'
  | 'pickupFormWasteTypePlaceholder'
  | 'pickupFormQuantityLabel'
  | 'pickupFormQuantityPlaceholder'
  | 'pickupFormQuantityHelper'
  | 'pickupFormDateLabel'
  | 'pickupFormDatePlaceholder'
  | 'pickupFormNotesLabel'
  | 'pickupFormNotesPlaceholder'
  | 'pickupFormSubmitButton'
  | 'pickupFormSubmittingButton'
  | 'pickupOrderSubmittedToastTitle'
  | 'pickupOrderSubmittedToastDesc'
  | 'pickupSubmitErrorTitle'
  | 'pickupSubmitErrorDesc'
  | 'pickupSubmitErrorFirebase'
  // Driver Pages
  | 'driverScheduleTitle'
  | 'driverScheduleDesc'
  | 'driverScheduleNoPickups'
  | 'driverScheduleNoPickupsSub'
  | 'driverPickupCardAddressLabel'
  | 'driverPickupCardDateLabel'
  | 'driverPickupCardTimeLabel'
  | 'driverPickupCardWasteTypeLabel'
  | 'driverPickupCardNotesLabel'
  | 'driverPickupCardNavigateButton'
  | 'driverPickupCardContactButton'
  | 'driverScheduleLoading'
  | 'driverScheduleAccessDenied'
  | 'driverScheduleFetchErrorTitle'
  | 'driverScheduleFetchError'
  | 'firestoreIndexSuggestion'
  | 'addressNotAvailable'
  | 'driverNavigationAddressMissingTitle'
  | 'driverNavigationAddressMissingDesc'
  // Settings Page
  | 'settingsTitle'
  | 'settingsDesc'
  | 'settingsProfileInfoTitle'
  | 'settingsChangeAvatarButton'
  | 'settingsFullNameLabel'
  | 'settingsEmailLabel'
  | 'settingsCustomerTierLabel'
  | 'settingsSecurityTitle'
  | 'settingsCurrentPasswordLabel'
  | 'settingsCurrentPasswordPlaceholder'
  | 'settingsNewPasswordLabel'
  | 'settingsNewPasswordPlaceholder'
  | 'settingsConfirmPasswordLabel'
  | 'settingsConfirmPasswordPlaceholder'
  | 'settingsSaveChangesButton'
  | 'avatarSelectedToastTitle'
  | 'avatarSelectedToastDesc'
  | 'profileUpdateSuccessTitle'
  | 'profileNameUpdateSuccessDesc'
  | 'profileUpdateErrorTitle'
  | 'passwordChangeAttemptTitle'
  | 'passwordChangeStubDesc'
  | 'passwordChangeCurrentRequiredError'
  | 'noChangesDetectedToastTitle'
  | 'noChangesDetectedToastDesc'
  | 'loadingUserSettings'
  | 'savingChangesButton'
  // Dashboard Page
  | 'dashboardGreetingMorning'
  | 'dashboardGreetingAfternoon'
  | 'dashboardGreetingEvening'
  | 'dashboardQuickActionsTitle'
  | 'dashboardGoToButtonLabel'
  | 'dashboardPlatformActivityTitle'
  | 'dashboardPlatformActivityDesc'
  | 'dashboardStatsComingSoon'
  | 'dashboardViewContractsDesc'
  | 'dashboardOrderPickupDesc'
  | 'dashboardManageUsersDesc'
  | 'dashboardManageContractsDesc'
  | 'dashboardManageReportsDesc'
  | 'dashboardViewAnalyticsDesc'
  | 'dashboardViewScheduleDesc'
  | 'dashboardUserRoleLabel'
  | 'dashboardUserTierLabel'
  // AuthContext specific
  | 'authContextRoleMismatchWarning'
  | 'authContextNoFirestoreProfileWarning'
  | 'authContextErrorCreatingProfile'
  | 'authContextErrorFetchingProfile'
  | 'authContextFallbackToMinimalUser'
  | 'authContextUserLoggedOut'
  | 'authContextErrorDeterminingRole'
  | 'authContextErrorSettingFirestoreProfile'
  | 'failed'
  | 'contractTableEmpty'
  | 'refresh'
  | 'approvingStatus'
  | 'completedStatus'
  | 'pickupStatusRequested'
  | 'pickupStatusScheduled'
  | 'pickupStatusCancelled'
  ;

export type TranslationSet = Record<TranslationKey, string>;

export const translations: Record<Language, TranslationSet> = {
  en: {
    appName: 'TaherBioSafe',
    navHome: 'Home',
    navServices: 'Services',
    navAboutUs: 'About Us',
    loginButton: 'Login',
    logoutButton: 'Log out',
    accountSettingsNav: 'Account Settings',
    dashboardNavLabel: 'Dashboard',
    myContractsNavLabel: 'My Contracts',
    requestNewContractNavLabel: 'Request New Contract',
    orderPickupNavLabel: 'Order Pickup',
    userManagementNavLabel: 'User Management',
    contractManagementNavLabel: 'Contract Management',
    pickupLogisticsNavLabel: 'Pickup Logistics',
    incinerationReportsNavLabel: 'Incineration Reports',
    statisticsNavLabel: 'Statistics',
    myScheduleNavLabel: 'My Schedule',
    settingsNavLabel: 'Settings',
    overviewGroupLabel: 'Overview',
    customerPortalGroupLabel: 'Customer Portal',
    administrationGroupLabel: 'Administration',
    operationsGroupLabel: 'Operations',
    analyticsGroupLabel: 'Analytics',
    driverPortalGroupLabel: 'Driver Portal',
    generalGroupLabel: 'General',
    manageWasteIncineration: 'Manage your waste incineration processes efficiently with TaherBioSafe.',
    safeResponsibleWasteManagement: 'Safe & Responsible Waste Management with TaherBioSafe',
    trustedPartnerSecureWaste: 'Your trusted partner for secure biohazard, chemical, and medical waste disposal. We ensure compliance and environmental safety.',
    exploreOurServicesButton: 'Explore Our Services',
    learnMoreAboutUsButton: 'Learn More About Us',
    aboutAppName: 'About TaherBioSafe',
    committedToSafeWaste: 'Committed to providing safe, reliable, and environmentally responsible waste management solutions.',
    ourServicesTitle: 'Our Services',
    comprehensiveWasteManagement: 'TaherBioSafe offers a comprehensive suite of waste management and disposal services, ensuring safety and compliance for various industries.',
    copyright: 'All rights reserved.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    welcomeToAppNameDashboard: "Welcome to your TaherBioSafe dashboard. Here's a quick overview.",
    loadingAppName: 'Loading TaherBioSafe...',
    keyFeaturesBadge: 'Key Features',
    whyChooseUsTitle: 'Why Choose TaherBioSafe',
    whyChooseUsDesc: 'We provide specialized solutions for all types of waste, ensuring safety, regulatory compliance, and environmental protection throughout the incineration process.',
    comprehensiveServicesTitle: 'Comprehensive Services',
    comprehensiveServicesDesc: 'From biohazard to chemical waste, we handle it all with expertise.',
    complianceFocusedTitle: 'Compliance Focused',
    complianceFocusedDesc: 'Adhering to the strictest environmental and safety regulations.',
    reliablePickupsTitle: 'Reliable Pickups',
    reliablePickupsDesc: 'Timely and efficient waste collection services tailored to your needs.',
    readyForSecureWasteManagementTitle: 'Ready for Secure Waste Management?',
    readyForSecureWasteManagementDesc: 'Partner with TaherBioSafe for peace of mind. Log in or contact us to get started.',
    clientLoginRequestServiceButton: 'Client Login / Request Service',
    newClientNote: 'New clients can request services through the login portal or contact us.',
    ourMission: 'Our Mission',
    ourMissionDesc: 'To be the leading provider of specialized waste management services, prioritizing safety, compliance, and customer satisfaction while protecting our communities and the environment. We operate with integrity and a deep sense of responsibility, honouring the values of diligence and care.',
    ourValues: 'Our Values',
    valueSafetyFirst: 'Safety First: Uncompromising commitment to the safety of our team, clients, and the public.',
    valueCompliance: 'Compliance: Strict adherence to all environmental and safety regulations.',
    valueReliability: 'Reliability: Dependable and timely service delivery.',
    valueIntegrity: 'Integrity: Conducting business with honesty and transparency.',
    valueResponsibility: 'Responsibility: Environmental stewardship and community focus.',
    ourStory: 'Our Story',
    ourStoryDesc1: 'Founded with a vision for cleaner and safer communities, TaherBioSafe has grown into a trusted partner for businesses and institutions requiring specialized waste management. Our dedication stems from a deep-rooted belief in responsible practices and service excellence.',
    ourStoryDesc2: 'We leverage technology and expertise to provide efficient solutions, ensuring peace of mind for our clients and contributing to a healthier environment for future generations.',
    meetOurTeam: 'Meet Our Team (Placeholder)',
    teamMemberPlaceholder: 'Team Member',
    roleTitlePlaceholder: 'Role/Title',
    dedicatedTeamSupport: 'Our dedicated team of professionals is here to support you.',
    servicesWasteTypesTitle: 'Types of Waste We Handle',
    servicesServiceTiersTitle: 'Service Tiers',
    servicesPaymentOptionsTitleAlgeria: 'Payment Options (Algeria)',
    servicesPaymentOptionsDescAlgeria: 'For our clients in Algeria, we offer convenient payment methods:',
    paymentPaysera: 'Paysera',
    paymentPayseraDesc: 'Easy online payments.',
    paymentCIB: 'CIB Cards',
    paymentCIBDesc: 'Accepted via bank terminals.',
    paymentEldahabia: 'Eldahabia Card',
    paymentEldahabiaDesc: 'Pay using your national card.',
    paymentConfirmNote: 'Please confirm payment details when setting up your contract or scheduling a pickup.',
    contactTierDiscussion: 'Contact us to discuss the best tier for your organization.',
    serviceTierFeature1: 'Standard Collection',
    serviceTierFeature2: 'Compliance Documentation',
    serviceTierPremiumSupport: 'Dedicated Support',
    formLabelEmail: 'Email',
    formPlaceholderEmail: 'you@example.com',
    formLabelPassword: 'Password',
    formLabelRole: 'Login as',
    formPlaceholderRole: 'Select a role',
    formDescRole: 'This role selection helps in setting up your initial profile.',
    loginRoleSelectionDesc: 'Select your primary role. This determines the initial setup if you are a new user. Admin privileges are verified via Custom Claims or Firestore.',
    formLabelTier: 'Customer Tier',
    formPlaceholderTier: 'Select customer tier',
    loginSuccessTitle: 'Login Successful',
    loginSuccessDesc: 'Welcome back! Redirecting to your {role} dashboard.',
    loginErrorTitle: 'Login Failed',
    loginErrorInvalidCredential: 'Invalid email or password. Please try again.',
    loginErrorTooManyRequests: 'Too many failed login attempts. Please try again later.',
    loginErrorDefault: 'An unexpected error occurred. Please try again.',
    loginButtonLoading: 'Logging in...',
    formLabelName: 'Full Name',
    formPlaceholderName: 'Enter your full name',
    formDescName: 'Visible on your profile.',
    // Admin Pages
    adminReportsTitle: "AI-Powered Report Summarization",
    adminReportsDesc: "Quickly summarize and categorize waste incineration reports. Paste the report text below to get started.",
    reportSummarizerCardTitle: "AI Generated Summary",
    reportSummarizerCardDesc: "Review the AI-generated summary, categories, and key metrics below.",
    reportSummarizerTextareaPlaceholder: "Paste your waste incineration report text here...",
    reportSummarizerButton: "Summarize Report",
    reportSummarizerButtonLoading: "Summarizing...",
    reportSummarizerErrorTitle: "Error",
    reportSummarizerResultTitle: "AI Generated Summary",
    reportSummarizerResultDesc: "Review the AI-generated summary, categories, and key metrics below.",
    reportSummarizerSummaryLabel: "Summary:",
    reportSummarizerCategoriesLabel: "Categories:",
    reportSummarizerKeyMetricsLabel: "Key Metrics:",
    reportSummarizedSuccessTitle: "Report Summarized Successfully!",
    reportSummarizedSuccessDesc: "The AI has processed the report.",
    userManagementTitle: "User Management",
    userManagementDesc: "Add, edit, or remove users and manage their roles.",
    userManagementAddButton: "Add New User Profile",
    userManagementDialogTitleAdd: "Add New User Profile",
    userManagementDialogTitleEdit: "Edit User Profile",
    userManagementDialogDescAdd: "Enter details for the new user profile. User must exist in Firebase Auth. This form creates/updates their Firestore profile.",
    userManagementDialogDescEdit: "Update profile details for {userName}. For admin role changes, ensure Firebase Custom Claims are updated via Admin SDK.",
    userFormFullNameLabel: "Full Name",
    userFormFullNamePlaceholder: "Djamel Khermiche",
    userFormEmailLabel: "Email Address (Must match Firebase Auth)",
    userFormEmailPlaceholder: "user@example.dz",
    userFormPasswordLabel: "Password (For new Auth user - Not handled here)",
    userFormPasswordPlaceholder: "********",
    userFormPasswordDesc: "Firebase Auth user creation is separate. This manages Firestore profiles only.", // ✅ FIX: Added missing key
    userFormRoleLabel: "Role (in Firestore Profile)",
    userFormRolePlaceholder: "Select user role for Firestore",
    userFormTierLabel: "Customer Tier",
    userFormTierPlaceholder: "Select customer tier",
    userFormCancelButton: "Cancel",
    userFormSubmitButtonEdit: "Save Changes",
    userFormSubmitButtonAdd: "Create Profile",
    userDeletedToastTitle: "User Profile Deleted",
    userDeletedToastDesc: "User profile for {userId} removed from Firestore.",
    userUpdatedToastTitle: "User Profile Updated",
    userUpdatedToastDesc: "{userName}'s profile details updated in Firestore.",
    userAddedToastTitle: "User Profile Added",
    userAddedToastDesc: "Profile for {userName} added to Firestore.",
    userTableHeadUser: "User",
    userTableHeadEmail: "Email",
    userTableHeadRole: "Role",
    userTableHeadTier: "Tier",
    userTableHeadActions: "Actions",
    userTableActionEdit: "Edit Profile",
    userTableActionChangeRole: "Change Auth Role (Admin SDK)",
    userTableActionDelete: "Delete Profile",
    userManagementNoPermissionError: "You do not have permission for this action. Admin/Owner role required.",
    userManagementFetchErrorAdminStrict: "Failed to fetch user list for admin '{adminEmail}'. Details: {errorDetails}. CRITICAL: Ensure your Firebase Custom Claim ('{customClaimExample}') is correctly set for this admin user AND their ID token has been refreshed (log out/in). Also, verify your EXACT PUBLISHED Firestore rules ('{rulesChecked}') allow admin access to list users.",
    userManagementFetchErrorTitle: "Error Fetching Users",
    userNotLoggedInError: "You must be logged in to perform this action.",
    userManagementActionErrorTitle: "Action Failed",
    userManagementCannotDeleteOwnerError: "Owner role cannot be deleted by other admins.",
    userManagementCannotDeleteSelfAsOwnerError: "Owner/Admin cannot delete their own account through this interface.",
    userManagementDeleteErrorTitle: "Error Deleting User Profile",
    userManagementSaveErrorTitle: "Error Saving User Profile",
    userManagementNoUsersFound: "No user profiles found in Firestore.",
    userManagementNoUsersFirestoreCheck: "Ensure user documents exist in 'users' collection. For admin '{adminEmail}', verify PUBLISHED Firestore rules ('{rulesChecked}') allow listing users, and if using Custom Claims ('{customClaimExample}'), ensure it's set and ID token is refreshed.",
    userManagementPermissionErrorAdminCustomClaim: "Permission Denied for Admin '{adminEmail}'. Ensure PUBLISHED Firebase Custom Claim ('{requiredClaim}') is set and ID token is refreshed. Verify Firestore rules are correctly published and allow access based on this claim.",
    userManagementLoadingUsers: 'Loading users...',
    userTableActionOpenMenu: 'Open menu',
    pickupLogisticsTitle: "Pickup Logistics",
    pickupLogisticsDesc: "Manage and schedule all customer waste pickups.",
    pickupTableHeadId: "Pickup ID",
    pickupTableHeadCustomer: "Customer",
    pickupTableHeadWasteType: "Waste Type",
    pickupTableHeadPreferredDate: "Preferred Date",
    pickupTableHeadStatus: "Status",
    pickupTableHeadDriver: "Driver",
    pickupTableHeadActions: "Actions",
    pickupTableAssignDriverPlaceholder: "Assign Driver",
    pickupTableActionViewDetails: "View Details",
    pickupTableActionSchedule: "Schedule Pickup",
    pickupTableActionMarkCompleted: "Mark as Completed",
    pickupTableActionCancel: "Cancel Pickup",
    pickupTableActionDelete: "Delete Request",
    noPickupsFound: "No pickups found matching the criteria.",
    pickupManagementNoPermissionError: "You do not have permission for this action. Admin/Owner role required.",
    pickupManagementFetchError: "Failed to fetch pickups. Details: {errorDetails}. If this is an index issue, please check the browser console for a link to create it.",
    pickupManagementFetchErrorTitle: "Error Fetching Pickups",
    pickupManagementActionErrorTitle: "Pickup Action Failed",
    pickupManagementUpdateErrorTitle: "Error Updating Pickup",
    pickupManagementErrorPrefix: "Error:",
    pickupDriverAssignedTitle: "Driver Assigned",
    pickupDriverAssignedDesc: "Driver {driverName} assigned to pickup {pickupId}.",
    pickupStatusUpdatedTitle: "Pickup Status Updated",
    pickupStatusUpdatedDesc: "Pickup {pickupId} status updated to {status}.",
    pickupManagementLoadingPickups: "Loading pickups...",
    pickupManagementNoPickupsFirestoreCheck: "No pickups found in Firestore, or there's a permission issue for admin {adminEmail}. Ensure admin has correct PUBLISHED Firestore rules allowing list, and if using Custom Claims, ensure claim is set and ID token is refreshed. Check for Firestore indexing links in browser console if using 'orderBy'.",
    unassignedLabel: "Unassigned",
    noDriversFound: "No drivers found",
    contractManagementTitle: "Contract Management",
    contractManagementDesc: "Oversee and manage all customer service contracts.",
    contractTableTabAll: "All Contracts",
    contractTableTabPending: "Pending Approval",
    contractTableTabAwaitingSignatures: "Awaiting Signatures",
    contractTableTabActive: "Active",
    contractTableTabExpired: "Expired",
    contractTableTabArchived: "Archived",
    contractTableNoContractsInCategory: "No contracts found in this category.",
    contractTableHeadId: "Contract ID",
    contractTableHeadCustomer: "Customer",
    contractTableHeadTier: "Tier",
    contractTableHeadStatus: "Status",
    contractTableHeadRequested: "Requested",
    contractTableHeadActions: "Actions",
    contractTableActionViewDetails: "View Details",
    contractTableActionEdit: "Edit Contract",
    contractTableActionApprove: "Approve",
    contractTableActionMarkSigned: "Mark Signed & Activate",
    contractTableActionArchive: "Archive",
    contractTableActionDelete: "Delete",
    contractApprovedToastTitle: "Contract Approved",
    contractApprovedToastDesc: "Contract {contractId} status set to 'Awaiting Signatures'.",
    contractActivatedToastTitle: "Contract Activated",
    contractActivatedToastDesc: "Contract {contractId} is now active.",
    contractArchivedToastTitle: "Contract Archived",
    contractArchivedToastDesc: "Contract {contractId} has been archived.",
    contractManagementPermissionErrorAdminStrict: "Permission Denied for Admin '{adminEmail}'. CRITICAL: Ensure Firebase Custom Claim ('{requiredClaim}') is set, ID token is refreshed, AND PUBLISHED Firestore rules ('{rulesChecked}') grant access based on this claim. Details: {errorDetails}",
    contractManagementFetchErrorAdminStrict: "Failed to fetch contracts for admin '{adminEmail}'. Details: {errorDetails}. CRITICAL: Ensure Firebase Custom Claim ({customClaimExample}) is set, ID token is refreshed, AND PUBLISHED Firestore rules ({rulesChecked}) allow admin access based on this claim. Check browser console for potential Firestore indexing links if using 'orderBy'.",
    contractManagementFetchErrorTitle: "Error Fetching Contracts",
    contractManagementUpdateErrorTitle: "Error Updating Contract",
    contractManagementActionErrorTitle: "Action Failed",
    contractManagementNoContractsFirestoreCheckStrict: "No contracts found in Firestore, or there's a permission issue for admin '{adminEmail}'. Verify Custom Claim ('{customClaimExample}')",
    contractManagementLoadingContracts: 'Loading contracts...',
    contractManagementErrorPrefix: 'Error:',
    contractTableActionOpenMenu: 'Open actions menu',
    errorDialogTitle: 'An Error Occurred',
    unknownStatus: 'Unknown Status',
    statisticsTitle: 'Platform Statistics',
    statisticsDesc: 'An overview of key metrics across the platform.',
    statsTotalActiveUsers: 'Total Active Users',
    statsActiveContracts: 'Active Contracts',
    statsPickupsThisMonth: 'Pickups This Month',
    statsReportsSummarized: 'Reports Summarized',
    statsMonthlyContractGrowth: 'Monthly Contract Growth',
    statsPickupVolumeTrends: 'Pickup Volume Trends',
    statsChartPlaceholderContracts: 'Contracts',
    statsChartPlaceholderPickups: 'Pickups',
    statsUsersChange: 'from last month',
    statsContractsChange: 'from last month',
    statsPickupsChange: 'from last month',
    statsReportsInsight: 'insights generated',
    // Customer Pages
    customerMyContractsTitle: 'My Service Contracts',
    customerMyContractsDesc: 'View the status and details of all your contracts.',
    customerRequestNewContractButton: 'Request New Contract',
    customerNoContractsMessage: "You don't have any contracts yet.",
    customerRequestFirstContractButton: 'Request Your First Contract',
    customerContractTableHeadService: 'Service Description',
    customerContractTableHeadEffectiveDate: 'Effective Dates',
    customerContractTableActionView: 'View',
    customerContractTableActionDownload: 'Download',
    customerContractTableActionRenew: 'Renew',
    customerContractsFooterShowing: 'Showing {count} contracts.',
    customerFetchError: "Failed to fetch your contracts. Details: {errorDetails}. Query attempted: {queryInfo}",
    customerRequestContractTitle: 'Request a New Service Contract',
    customerRequestContractDesc: 'Please fill out the form below to request a new service contract. Our team will review it and send it for approval.',
    contractFormCompanyNameLabel: 'Company Name',
    contractFormCompanyNamePlaceholder: 'e.g., Algiers Medical Clinic',
    contractFormContactPersonLabel: 'Contact Person Name',
    contractFormContactPersonPlaceholder: 'e.g., Dr. Fatima Zohra',
    contractFormEmailLabel: 'Contact Email',
    contractFormEmailPlaceholder: 'contact@yourclinic.dz',
    contractFormPhoneLabel: 'Contact Phone',
    contractFormPhonePlaceholder: '+213 ...',
    contractFormServiceDescLabel: 'Service Description',
    contractFormServiceDescPlaceholder: 'e.g., Weekly pickup of biohazard waste, monthly chemical waste disposal...',
    contractFormServiceDescHelper: 'Briefly describe the type and frequency of waste collection you require.',
    contractFormTierLabel: 'Requested Service Tier',
    contractFormTierPlaceholder: 'Select a service tier',
    contractFormSignatureLabel: 'Digital Signature (Full Name)',
    contractFormSignaturePlaceholder: 'Type your full name to sign',
    contractFormSignatureDesc: 'By typing your name, you agree to the terms of this service request.',
    contractFormAgreeToTermsLabel: 'I agree to the terms and conditions.',
    contractFormSubmitButton: 'Submit Request',
    contractFormSubmittingButton: 'Submitting...',
    contractRequestSubmittedToastTitle: 'Contract Request Submitted',
    contractRequestSubmittedToastDesc: 'Your request has been sent for review. We will notify you once it is approved.',
    contractRequestSubmitErrorTitle: 'Submission Failed',
    orderPickupTitle: 'Request a Waste Pickup',
    orderPickupDesc: 'Schedule a pickup for your waste materials. Please provide the necessary details below.',
    pickupFormWasteTypeLabel: 'Type of Waste',
    pickupFormWasteTypePlaceholder: 'Select the type of waste',
    pickupFormQuantityLabel: 'Quantity',
    pickupFormQuantityPlaceholder: 'e.g., 10kg, 2 bins, 50 liters',
    pickupFormQuantityHelper: 'Provide an estimate of the quantity to be collected.',
    pickupFormDateLabel: 'Preferred Pickup Date',
    pickupFormDatePlaceholder: 'Pick a date',
    pickupFormNotesLabel: 'Additional Notes',
    pickupFormNotesPlaceholder: 'e.g., "Access via back gate", "Call upon arrival"',
    pickupFormSubmitButton: 'Request Pickup',
    pickupFormSubmittingButton: 'Requesting...',
    pickupOrderSubmittedToastTitle: 'Pickup Requested',
    pickupOrderSubmittedToastDesc: 'Your request for a {wasteType} pickup on {date} has been submitted.',
    pickupSubmitErrorTitle: 'Request Failed',
    pickupSubmitErrorDesc: 'Could not submit your pickup request. Please try again.',
    pickupSubmitErrorFirebase: 'Firestore Error ({code}): {message}',
    // Driver Pages
    driverScheduleTitle: "Today's Pickup Schedule",
    driverScheduleDesc: 'Review and manage your assigned pickups for the day.',
    driverScheduleNoPickups: 'No pickups scheduled for today.',
    driverScheduleNoPickupsSub: 'Check back later or contact dispatch for assignments.',
    driverPickupCardAddressLabel: 'Address',
    driverPickupCardDateLabel: 'Date',
    driverPickupCardTimeLabel: 'Time',
    driverPickupCardWasteTypeLabel: 'Waste Type',
    driverPickupCardNotesLabel: 'Notes',
    driverPickupCardNavigateButton: 'Navigate',
    driverPickupCardContactButton: 'Contact',
    driverScheduleLoading: 'Loading your schedule...',
    driverScheduleAccessDenied: 'Access Denied. This page is for authorized drivers only.',
    driverScheduleFetchErrorTitle: 'Error Fetching Schedule',
    driverScheduleFetchError: 'Could not load your schedule. Details: {errorDetails}',
    firestoreIndexSuggestion: 'This may require a new Firestore index. Please check the browser console for a link to create it.',
    addressNotAvailable: 'Address not provided',
    driverNavigationAddressMissingTitle: 'Navigation Error',
    driverNavigationAddressMissingDesc: 'Address is not available for this pickup.',
    // Settings Page
    settingsTitle: 'Account Settings',
    settingsDesc: 'Manage your profile information and security settings.',
    settingsProfileInfoTitle: 'Profile Information',
    settingsChangeAvatarButton: 'Change Avatar',
    settingsFullNameLabel: 'Full Name',
    settingsEmailLabel: 'Email Address',
    settingsCustomerTierLabel: 'Customer Tier',
    settingsSecurityTitle: 'Security',
    settingsCurrentPasswordLabel: 'Current Password',
    settingsCurrentPasswordPlaceholder: 'Enter your current password',
    settingsNewPasswordLabel: 'New Password',
    settingsNewPasswordPlaceholder: 'Enter a new password',
    settingsConfirmPasswordLabel: 'Confirm New Password',
    settingsConfirmPasswordPlaceholder: 'Confirm your new password',
    settingsSaveChangesButton: 'Save Changes',
    avatarSelectedToastTitle: 'Avatar Selected',
    avatarSelectedToastDesc: 'File {fileName} is ready. Click "Save Changes" to upload.',
    profileUpdateSuccessTitle: 'Profile Updated',
    profileNameUpdateSuccessDesc: 'Your name has been successfully updated.',
    profileUpdateErrorTitle: 'Update Failed',
    passwordChangeAttemptTitle: 'Password Change',
    passwordChangeStubDesc: 'Password change functionality is not yet implemented.',
    passwordChangeCurrentRequiredError: 'Current password is required to set a new one.',
    noChangesDetectedToastTitle: 'No Changes',
    noChangesDetectedToastDesc: 'No changes were detected to save.',
    loadingUserSettings: 'Loading your settings...',
    savingChangesButton: 'Saving...',
    // Dashboard Page
    dashboardGreetingMorning: 'Good Morning',
    dashboardGreetingAfternoon: 'Good Afternoon',
    dashboardGreetingEvening: 'Good Evening',
    dashboardQuickActionsTitle: 'Quick Actions',
    dashboardGoToButtonLabel: 'Go To',
    dashboardPlatformActivityTitle: 'Platform Activity',
    dashboardPlatformActivityDesc: 'A high-level overview of recent activities and key metrics.',
    dashboardStatsComingSoon: 'Statistics coming soon.',
    dashboardViewContractsDesc: 'View and manage all customer contracts.',
    dashboardOrderPickupDesc: 'Request a new waste pickup.',
    dashboardManageUsersDesc: 'Add, edit, and manage user accounts.',
    dashboardManageContractsDesc: 'Oversee all customer service contracts.',
    dashboardManageReportsDesc: 'Generate and analyze incineration reports.',
    dashboardViewAnalyticsDesc: 'View detailed platform analytics.',
    dashboardViewScheduleDesc: 'View and manage your pickup schedule.',
    dashboardUserRoleLabel: 'Role',
    dashboardUserTierLabel: 'Tier',
    // AuthContext specific
    authContextRoleMismatchWarning: 'Role mismatch detected. Session role set by custom claim.',
    authContextNoFirestoreProfileWarning: 'No Firestore profile found. A preliminary user object was created.',
    authContextErrorCreatingProfile: 'Error creating user profile in Firestore.',
    authContextErrorFetchingProfile: 'Error fetching user profile from Firestore.',
    authContextFallbackToMinimalUser: 'Proceeding with minimal user data due to Firestore error.',
    authContextUserLoggedOut: 'User is logged out.',
    authContextErrorDeterminingRole: 'Could not determine user role from claims or Firestore.',
    authContextErrorSettingFirestoreProfile: 'Failed to set user profile in Firestore.',
    failed: 'Failed',
    contractTableEmpty: 'No contracts to display in this category.',
    refresh: 'Refresh',
    approvingStatus: 'Approving',
    completedStatus: 'Completed',
    pickupStatusRequested: 'Requested',
    pickupStatusScheduled: 'Scheduled',
    pickupStatusCancelled: 'Cancelled',
  },
  ar: {
    // This would be filled with Arabic translations
  } as unknown as TranslationSet,
};
