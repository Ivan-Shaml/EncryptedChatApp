from selenium import webdriver
from selenium.webdriver.common.alert import Alert
import os
import time


def menu():
    print("Login as:\n")
    print(" (1) user1@abv.bg")
    print(" (2) user2@abv.bg")
    print(" (3) user3@abv.bg")
    print("\n (4) Exit script")
    choice = int(input("\nEnter option: "))
    if choice == 4:
        print("Exiting ...")
        exit()
    return {
        1: 'user1@abv.bg',
        2: 'user2@abv.bg',
        3: 'user3@abv.bg'
    }.get(choice, 'only 1 - 4')


PrivateKeys = dict()


PrivateKeys["user1"] = """-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA1CUO91e8cpKvNNLMEifyppNXi3itKFu54atYt4YaGb65TnIe
oqgLS+PD6fzI0Tc6vlUSMxa5nmDFyv2ElBECmFN08fwcQ9H/tLwAx0aFOG6a6NAD
sxy31ijAcVF+xw/eM2X5OuclMytcZF5EjdEQD7kezBq6bMXtfChFBYTeyTE7TuxG
BkEWYa0TRc2JTN20PEnmV3+PijZKkRMVcMOoieerDVEvPCqD+TwxIeftb3m8Jv54
qZCr0CD3dH3eKPbuZV+FVB6zDdyWMIJ0ps+dkYYmfvHxw7r1Jm+3CnpFybHk0CN/
JqOKKPxfPYnt/YRELW56hBUa9ysDywO/FdujmQIDAQABAoIBAH6kXMnVK18uJ7+d
80sHY/iCzukosh38m/uWwVBVkrE5xP+KarVpIc08+9BsIimbEctbl5C+CTL9zDXA
n+uQN/9dGtv2R51I+KAY91H+zDqC9KD0xLCg/TGwhClhoBAPbfM69cxu/isMwIv+
JmiOnEr2lOb9MbsLcRkEJSgFSMXLMr8r5DONmM8ZsyHO+JThLaRsc9qJpmQwXqqs
4CYvMXbEDznIGudWh1hSvJ5KD88M5LIXlcNWYI2+qxWxxH6WPxpzj7LKb04YJqYT
1k1P8X2sVizHpTah/3VdEWM2exoZP03BbumuIxVUSDY+sZfxtmDJdfuS3q7kM5Cb
yHhn7AECgYEA6z0vN63Tm1ax1ROCydGHR3tPTw94r9YWQ7r6wOIEqiRxixFwf6bD
FTS17NYEmxtgfd3OfP1LBTXeNNzkx61rfdb81gLNUyITIZI/ezGkCUYasFvfXq1T
I/UkJNgsOvyXGoDq0LGn5+7i8ttR9HEt5nmY1ACGu0JPqNWXAUVlSYECgYEA5t4Z
jv5bsXDSEeguFcV9XjyJ27nfkVVlnGFgLb93asT8bfuo2kAqgIO3q5rAfXZZW5t0
4wEsMN1+UeKZpI1P2ARTvROFQCsu/6wBmk04hFnG+rhN02AQXqPp5FCuM/FVYmYy
fleVNC60ajbealp2CMcynxtBGAY9GutGCU4WdhkCgYAmvKSR3qYB5nzSQaw/36kP
NFcTBdEx42c3MAsqyA1Ml0O7StvjqWpmi4+JuJR5lkCFeYkPPAamjQBSZC2oU/5n
coegFkYJcosD9DlP6BTDEjBC6l4WESSnvy58gryF2iJn0uLYCulDYCsvIr6UKi8M
zOlFv/Bv1bOYcdOz+eF8AQKBgG+iceVtJVV14n56MN6iMm8BAwBWrr6N9qZZh7JX
ZR0hx5Y/HHT8lhCyoHvARtfkBG2BjFHAXWf7kntyAS1Kj5M69Gr3J3XR69YBjHza
XjvRVaAiwq81QnUg+ZZHVRUU217LYBsrqqAi/WZmxcHToEO6XsYE3cMKMT31Clax
hbbxAoGAO+g8iq22bZ+XgXP5+6law0mwO0RY/4TJfZ3Cpk64iOL8FYF963zzBQ2T
geDhyKkP5KlEDEnbzM+B71Y95lBGuDP9ARhgfK4aXR5p2iKHHykV2S9GeM0dPPLr
qs/fqU1JTQeElQdllDPOqz4cJBNDU8EzkMwtDkH91a8+9LOm3eM=
-----END RSA PRIVATE KEY-----"""

PrivateKeys["user2"] = """-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAwgwrPWfg79f8PwahK4rbzDjGhgn3k7gaC7BX4LdEJSl83lnZ
pUMriyeKmnI1ePft0LfaYIKbC+BVKqENGqNE3zBPWrkTq4+16csRx+csImUTfCVT
xRme99Ot+kEsopRi0gxGQA7va0LHGFN/eXKHv89H89mU69nroot6t8dPyNmu63sB
cD2eQJEiWJ4PzloYHOKOuk0wel14UPcb2MJeuJmVxi4otELUvElG6Q1ChHzn58Lg
RHGfpFmff2p/VzCvAwxHDZYa2jgEgMGZwRhVa9c+XZ5cbwcHnE6hGnrcsnjt4Du7
1sswDszva/+RxseO7bx39bxIOICp53nJkrxelQIDAQABAoIBADTgIAAxiCeS0RdT
dSNqSQ5TAjWQDbhg2CgLO0buaVE/BtmH3jicHwdiFPCU4mE+Hb1b+9OEgz8vN8XP
8MQrbR7sCRONjwCWvlkgjo3MPkh5BmAzw6nXm2uocKXakJEUogDee14FM9QkdB/6
0KeFP9xSXSbjSSMjVIQMQbpGQ0VVIk8Q+i33tJr1uHWq3q6KhJLz/8EqR1/+r0OH
l9OQIaGDJmXdQoosZOcAPBkphCzI4ZB6lSrbXiT2dU6YmzsnQj+wAN8sDC93IdpZ
NWouB/Y1hjFVd5wF3zOnTLuZAl5oRq/vmZ9hdeizjQy3Q+0lEzN9p6o/XbOfWOVE
LqeUr0ECgYEA3/ljyu05eZAKZkgVSbvgC/sWHEENKwmSAHdw85HnCCN5cvt8TRah
oM2SQyk2s+PdTwvYoHI1OvMYDxOngoMzSQjvZZL5eFy9UsfqpYuVEvvBAUyga/ac
snmaNOAY/E9oOqdxuT51ver8Rx3XTf5hLnfUp8/1jA3F5kS4TedvudkCgYEA3ctP
PwNu/ZLC84W4gVttIS8QnaKJCZ9iOpsujJQnRQM1o+GM1ptD7AGttajDh4NHOq9q
htit23hWFqRF0Gu1L4SWm7TbfW0Pj9c+dVJVq9PeNduVXTJaDwrt/OMc1o+yNvXW
zbZddIRqBSpmhzXSQmfYOnWqo3ejRol7RRVrOR0CgYEAnCPIJhfrEYwRM+zcqmKH
dtK8P0Y6X950Ik8iNytn3IyehkI8DaHRW8D0Tk3VDOO1zP19L51u7oG6LAiPprTA
dBH+ktk7gWVltugX9QCyFGHd04IP9DQgWWvczS/NO1hAWWOSLIoWmyfOZ+Wty3mj
VjnDzplznQedB0KxGd5WTUECgYB4AzkgObVnFHDU4LiTlmsYl6UAByDrygiW+b1Y
aBpPp4rw4G0a+uzn2YirUWRsAUcbpCuaR8jbhuPeYIk+W+mwiqgMHPLfjZHsHWY4
iZK95WjJ78WEpmhA14MrYaELILooLyJKMbGkCLptjSHpa+AX+qTwDReGWIhK9L11
Bj/8qQKBgB9C/GpdXhdeSpD0LTFLnsccDtIx3txG3xTqgLULp8iHehCBIUBmG5IY
bgcNgZnZeDJKs0HbsmK9WflKyDSNK9Jj4tX/beLD8GxP8y5tvF1pMCmBQDVIEeld
ckX+7HYJWE7+PzO7Q0XdTvUjtNlHBSEOmEXc2C/5nb7fkB0IOAOh
-----END RSA PRIVATE KEY-----"""

PrivateKeys["user3"] = """-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAv6p0R+PvvGvVjWpVEUocf2y8g6/fWxXLi9LzfnYpBI8YosHs
0z8MdLWZHmn54DfPlOdoMBXsnP4trZwfQlBkprTUn3jwU9dsNv+QTErnCEEgnoqd
3EMpGFz7bk23Xj9LKCToQp/uuJbHDnaCTtIUae4ONy1HD7EPT8E6OJxEABJzgaTf
mSytakHf98ZPxj/TA64nlUUEHeQjuoojy6nfe13XdrEu38BmbiQUipLF7nyV25XW
e9txs5rqYzoj5zl11cVSiQJZqUfe6WaD6U+sB9MLZLRQHgBnSumrSQRIA9Kc755E
BmoJ864t95Pmb/vud0yNzbQbKHo3XMjQS39VuwIDAQABAoIBABLJioxhc2Zsy4oJ
Gj2Pnit/ZRsjailrgYA7NVL4Eh04SZnqmGQ8keP+yPuKN8warGZUKIpOG9tnruKN
oyLE7pjIsO7Q0/3j59+cPXC9BthwSdpAjCjDDIwu0RaG16qNWbidpYaiVqwRW4G3
bB59yTJ4+zu9XHHVUULoFeTmrGO1P5cNi6JhIBYyJ7IEGJC9+6mICazhNGzLBxyW
u1yThp2XNNrR/1FMbgNxVNg/iqOs2OlgAYfKANRk/uSXLjhMbfBtjOghJzQDbzID
qvvVrVbYTI/4L3d7F98ZmuvDwSb50UhBDa95+2+zZG4CBfK9rqZvmgbxnnFerGVb
ngxc+EECgYEA+Gz2mudk3sqQoiYSW3JCqUb/ECNA5iWBcHImsX9fEd6BpLeqha0P
V75JqVVY+mpyi806A3kdG+cKLZ1CjsM0ivzOJTVGeCT7R0wSEFzKSMxNV06BwSKa
p1TLdFBH9vXKCnPFBUeMnCd4CXIoGqvxxfB7mOtSUHAUJz4c80qXEDUCgYEAxYJ2
sHQPwjesOYIrZzlEZlRJlX746CwNviMsnTRtG1tF8aEaqRERXR4vhzMjXRTMAigl
MWKQFXbkxVFciBcpVNDbOn2TGb1ClNjVDJhKXK0cXLk8dsQka7WpIgkMI/6czlYi
+JZj2Srxb2JqC1Y57G1hrOR35L5AiHeeBNrZbC8CgYEA2RmYdY0MiOrrdNjiqAn1
mauS0c6NM9PJB7Sqfem68onKMGHV4tZ3lw2ToCkXBliqW+Rw84IPX0gMjApnlQ2g
yGnf2YJyYCKpeghPrP76RJ5OZKMWH+uWze77kl1qVrc75uB/aHq7teeELnUV+SEU
vA/KY7wbBnK8GgNdF3yzAZUCgYEAne7944lbFI2aDP5WoJr9Y+ogUQeQF28qqhDM
WwSR/l8U5etSO0DnppM9pBmzPHoly8+4Ne4/krpYoqO1nykOJsE/nFzPpLRfKlDc
w85/H+5ZEJgajkm3ad2AWjPr3lh5oNDl8+ul+gDJwKxsaZZQiQrKIQssB+BOEBG+
bNlnJIcCgYAekd5SJozsBhceQB4JcdXeumcYhMM508TQ5yf1vxkwC8PJShRNFA1O
mJqT/m9Uu1L7aOuKM+m/dVQPwf6gUfeyyLNkLz6d8BpT1iiu9ou4QhBSZS+4AIRn
EiNVvxgks/vdst+MPnSjNsXRufvJ9Nn61VTAU8T6dgEHT9cY9mamLw==
-----END RSA PRIVATE KEY-----"""


loginUrl = 'https://localhost:44335/Identity/Account/Login'
chatUrl = 'https://localhost:44335/Home/Chat'
driver = webdriver.Chrome(os.getcwd() + "/chromedriver.exe")
userChoice = menu()
driver.get(loginUrl)

emailInput = driver.find_element_by_xpath("//*[@id='Input_Email']")
passwordInput = driver.find_element_by_xpath("//*[@id='Input_Password']")
loginButton = driver.find_element_by_xpath("//*[@id='login-submit']")


def clear():
    os.system('cls')


def stress_test(username, password, key, max_count):
    emailInput.send_keys(username)
    passwordInput.send_keys(password)
    loginButton.click()
    driver.get(chatUrl)
    time.sleep(3.5)
    alert = Alert(driver)
    alert.send_keys(key)
    alert.accept()
    message_input = driver.find_element_by_xpath("//*[@id='messageInput']")
    send_button = driver.find_element_by_xpath("//*[@id='sendButton']")
    count = 1
    while count <= max_count:
        message_input.send_keys("This is Message number " + str(count))
        send_button.click()
        clear()
        print("Sending message " + str(count) + " / " + str(max_count))
        count += 1


if userChoice == 'user1@abv.bg':
    stress_test(userChoice, '123456', PrivateKeys["user1"], 1000)
if userChoice == 'user2@abv.bg':
    stress_test(userChoice, '123456', PrivateKeys["user2"], 1000)
if userChoice == 'user3@abv.bg':
    stress_test(userChoice, '123456', PrivateKeys["user3"], 1000)
