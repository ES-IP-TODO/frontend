Feature: Add task

    Scenario: User adds a task
        Given a logged-in user,
        When they click in “New Task“ button,
        And fill the task form with the required information,
        Then the task should be saved and displayed in the task list.