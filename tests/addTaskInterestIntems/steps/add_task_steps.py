import os
import time

from behave import given, step, then, when
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
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

@when("they click in “New Task“ button,")
def they_click_in_add_task_button(context):
    wait = WebDriverWait(context.driver, 10)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[@id=\"root\"]/div[2]/div/div/button")))
    add_task_button = context.driver.find_element(By.XPATH, "//*[@id=\"root\"]/div[2]/div/div/button")
    add_task_button.click()

@step("fill the task form with the required information,")
def fill_the_task_form_with_required_information(context):
    wait = WebDriverWait(context.driver, 10)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[@id=\":r3:-form-item\"]")))
    task_name_input = context.driver.find_element(By.XPATH, "//*[@id=\":r3:-form-item\"]")
    task_name_input.send_keys("Test Task")
    task_description_input = context.driver.find_element(By.XPATH, "//*[@id=\":r4:-form-item\"]")
    task_description_input.send_keys("This is a test task")
    task_date_input = context.driver.find_element(By.XPATH, "//*[@id=\":r5:-form-item\"]")
    task_date_input.send_keys("11/11/2025")
    task_time_input = context.driver.find_element(By.XPATH, "//*[@id=\":r6:-form-item\"]")
    task_time_input.send_keys("11")
    task_time_input.send_keys("30")
    task_time_input.send_keys("A")
    
    priority_button = context.driver.find_element(By.XPATH, "//*[@id=\":r7:-form-item\"]")
    priority_button.click()
    wait.until(EC.visibility_of_element_located((By.XPATH, "//*[@id=\"radix-:r0:\"]/form/div[4]/select/option[2]")))
    priority_option = context.driver.find_element(By.XPATH, "//*[@id=\"radix-:r0:\"]/form/div[4]/select/option[2]")
    priority_option.click()

    priority_button.click()

    submit_button = context.driver.find_element(By.XPATH, "//*[@id=\"radix-:r0:\"]/form/button")
    submit_button.click()

@then("the task should be saved and displayed in the task list.")
def the_task_should_be_saved_and_displayed_in_the_task_list(context):
    task_list_row = context.driver.find_element(By.XPATH, "//*[@id=\"root\"]/div[2]/div/div/div[2]/div/table/tbody/tr[1]")
    assert task_list_row is not None


    