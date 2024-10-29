Feature: User Registration

    Scenario: Registration Page Contains Registration Form
        Given a new user,
        When they visit the login page
        And select the “Sign Up“ button
        And provide valid information,
        Then they should be able to create an account.