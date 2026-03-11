
Use src/layout for screen composition and shared UI coordination:
  - Put business logic and backend access in features, not layout.
  - Lift state to layout only when multiple shell regions need it and state it small, local to one shell area, and mostly about coordination.
  - Pass shell actions down as props.
  - Render features inside layout; do not let layout become a service layer.
  - Stop planning your implementation if the following occurs: state appears to be domain level or cross-cutting and multiple distant parts of the app need to read or update it over time. In this case, consult with me on whether we need to add a Provider instead of lifting state out to the layout.

Testing:
  - Write tests here only for layout composition and shared UI-state coordination.
  - Prefer mocking feature components/hooks rather than re-testing feature behavior inside layout tests.
