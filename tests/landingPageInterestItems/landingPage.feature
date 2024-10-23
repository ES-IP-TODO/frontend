Feature: Landing Page Items

    Scenario: Landing Page Contains Login Button that redirects to Login page
        Given a new user,
        When they visit the landing page
        And select Get Started button,
        Then the user should be redirected to the login_sign_up page.