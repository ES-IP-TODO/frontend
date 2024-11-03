import os
import time

from behave import given, step, then, when
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

load_dotenv()
LOGIN_SIGN_UP_URI = os.environ.get("VITE_LOGIN_SIGN_UP")


@given("a logged-in user,")
def given_a_logged_in_user(context):
    context.driver = webdriver.Chrome()

    context.driver.get(LOGIN_SIGN_UP_URI)
    
    username_input = context.driver.find_element(By.ID, "signInFormUsername")
    password_input = context.driver.find_element(By.ID, "signInFormPassword")
    username_input.send_keys("usertest")
    password_input.send_keys("Usertest1234*")

    assert username_input is not None
    assert password_input is not None

    login_button = context.driver.find_element(By.NAME, "signInSubmitButton")
    login_button.click()

    wait = WebDriverWait(context.driver, 10)
    wait.until(EC.url_to_be("http://localhost:5173/my-tasks"))

@when("they select the “Logout“ option,")
def they_select_the_logout_option(context):
    wait = WebDriverWait(context.driver, 10)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[@id=\"root\"]/div[2]/div/div/header/button")))
    logout_button = context.driver.find_element(By.XPATH, "//*[@id=\"root\"]/div[2]/div/div/header/button")
    logout_button.click()

@then("they should be logged out of the platform.")
def they_should_be_logged_out_of_the_platform(context):
    wait = WebDriverWait(context.driver, 10)
    wait.until(EC.url_to_be("http://localhost:5173/"))
    wait = WebDriverWait(context.driver, 10)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[@id=\"root\"]/div[2]/div/div/h1")))
    welcome_label = context.driver.find_element(By.XPATH, "//*[@id=\"root\"]/div[2]/div/div/h1")
    assert welcome_label is not None