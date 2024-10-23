import os

from behave import given, step, then, when
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

load_dotenv()
LOGIN_SIGN_UP_URI = os.environ.get("VITE_LOGIN_SIGN_UP")

pages = {
    "login_sign_up": LOGIN_SIGN_UP_URI,
}


@given("a new user,")
def given_a_new_user(context):
    context.driver = webdriver.Chrome()


@when("they visit the landing page")
def they_visit_the_landing_page(context):
    context.driver.get("http://localhost:5173/")


@step("select Get Started button,")
def select_button_with_text(context):
    wait = WebDriverWait(context.driver, 10)  # Espera até 10 segundos
    login_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//*[@id=\"root\"]/div[2]/div/div/a")))
    login_button.click()


@then("the user should be redirected to the {page_name} page.")
def the_user_should_be_redirected_to_the_login_sign_up_page(context, page_name):
    current_url = context.driver.current_url
    expected_url = pages[page_name]
    assert expected_url is not None
    assert current_url == expected_url