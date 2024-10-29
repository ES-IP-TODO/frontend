import os

from behave import given, step, then, when
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

load_dotenv()
LOGIN_SIGN_UP_URI = os.environ.get("VITE_LOGIN_SIGN_UP")

@given("a new user,")
def given_a_new_user(context):
    context.driver = webdriver.Chrome()

@when("they visit the login page")
def they_visit_the_login_page(context):
    context.driver.get(LOGIN_SIGN_UP_URI)

@step("select the “Sign Up“ button")
def select_the_sign_up_button(context):
    sign_up_link = context.driver.find_element(By.LINK_TEXT, "Sign up")
    sign_up_link.click()

@step("provide valid information,")
def provide_valid_information(context):
    wait = WebDriverWait(context.driver, 10)

    username_input = wait.until(EC.visibility_of_element_located((By.XPATH, "/html/body/div[1]/div/div[2]/div[2]/div[3]/div[2]/div/form/div[1]/input")))
    first_name_input = context.driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div[2]/div[3]/div[2]/div/form/div[2]/div/input")
    last_name_input = context.driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div[2]/div[3]/div[2]/div/form/div[3]/div/input")
    email_input = context.driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div[2]/div[3]/div[2]/div/form/div[4]/div/input")
    password_input = context.driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div[2]/div[3]/div[2]/div/form/input[2]")

    username_input.send_keys("test")
    first_name_input.send_keys("User")
    last_name_input.send_keys("Test")
    email_input.send_keys("teste@gmail.com")
    password_input.send_keys("Teste-122")

    assert username_input is not None
    assert first_name_input is not None
    assert last_name_input is not None
    assert email_input is not None
    assert password_input is not None

    sign_up_button = context.driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div[2]/div[3]/div[2]/div/form/button")
    sign_up_button.click()

@then("they should be able to create an account.")
def they_should_be_able_to_create_an_account(context):
    wait = WebDriverWait(context.driver, 10)
    already_exists_header = wait.until(EC.presence_of_element_located((By.XPATH, "/html/body/div[1]/div/div[2]/div[2]/div[3]/div[2]/div/form/p[1]")))

    assert already_exists_header is not None
    