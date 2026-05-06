 ### Phased Plan: Activity Redesign + AnalyticsScreen Routing

  ### Summary

  Deliver in 5 phases to reduce risk: contract/types first, then UI creation surfaces, then navigation switch,
  then DB migration/services, then test hardening and cleanup.

  ### Phase 1: Canonical Types and Contract Alignment

  - Update all ActivityType definitions/constants to:
      - lb_activities
      - vocab_activities
      - collocation_activities
      - dependency_activities
  - Remove explore_activities from renderer and Electron contract layers.
  - Update schema validation (z.enum(...)) and any compile-time unions tied to activity type.
  - Update copy/label maps that currently assume two types so all four types are explicit.

  ### Phase 2: Activities Creation Surfaces (MainView + Sidebar)

  - Update ActivitiesWelcome to present four create options.
  - Update ActivitiesStartModal and ActivitiesStartTransition for four activity-type-specific messages.
  - Replace explore sidebar action with vocab/collocation/dependency actions while retaining LB action.
  - Add new SVG icon components and wire button ARIA labels/tooltips.

  ### Phase 3: Analysis Entry Routing to AnalyticsScreen

  - Change MainView so navigationState.kind === "analysis" renders AnalyticsScreen instead of AnalysisView.
  - Ensure AnalyticsScreen reads the analysis navigation payload and supports current entry flow from:
      - ActivityCard Enter
      - ActivityStartProvider post-create auto-navigation.
  - Decouple shared analysis form type imports from AnalysisView so feature components no longer depend on it as
    a type source.

  ### Phase 4: Electron DB Migration and Activity Service Updates

  - Add new migration to:
      1. insert missing new activity types,
      2. convert existing activities.activity_type='explore_activities' to vocab_activities,
      3. delete explore_activities from activity_types.
  - Update base/seed migration behavior so fresh installs end with exactly the four supported types.
  - Update requestActivities summary-description mappings and any display-name assumptions for all four types.

  ### Phase 5: Tests, Regression Pass, and Safe Deactivation

  - Update failing tests that reference explore_activities or two-type assumptions.
  - Add focused tests for:
      - creating each of the four activity types,
      - sidebar controls for all four create actions,
      - post-create and manual entry both landing on AnalyticsScreen,
      - migration conversion of explore rows to vocab rows.
  - Keep AnalysisView in place but unreachable from MainView (temporary deactivation).
  - Document follow-up task to remove AnalysisView and dead references once AnalyticsScreen is fully mature.

  ### Assumptions

  - Legacy explore activities are migrated to vocab activities.
  - New dedicated SVG icons are required for vocab/collocation/dependency.
  - Navigation action/state names remain unchanged for this rollout (open-analysis, kind: "analysis").