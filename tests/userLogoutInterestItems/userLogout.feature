Feature: User Logout Items

    Scenario: Landing Page Contains Logout Button
        Given a logged-in user,
        When they select the “Logout“ option,
        Then they should be logged out of the platform.