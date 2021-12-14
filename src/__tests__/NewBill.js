import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"
import Firestore from "../app/Firestore"
import firebase from "../__mocks__/firebase.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I click on submit button", () => {
    test("Then the form should be submit", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))       
         
      const firestore = null
      const newBill = new NewBill({
        document, onNavigate, firestore, localStorage: window.localStorage
      })      
      
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const formNewBill = screen.getByTestId('form-new-bill')
      const formButton = screen.getByTestId('btn-send-bill')
      
      formButton.addEventListener('click',formNewBill.addEventListener('submit',handleSubmit))
      userEvent.click(formButton)

      expect(handleSubmit).toHaveBeenCalled()
    })
  })
  describe("When I am on NewBill Page and I click on 'Choose file' button", () => {
    test("Then a desktop window should open to choose a file", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))       
         
      const firestore = null
      const newBill = new NewBill({
        document, onNavigate, firestore, localStorage: window.localStorage
      })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const fileInputButton = screen.getByTestId('file')

      fileInputButton.addEventListener('click',handleChangeFile)
      userEvent.click(fileInputButton)

      expect(handleChangeFile).toHaveBeenCalled()
    })
  })
})

//Test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    test("form submition", async () => {
      const bill = {
        email:'johndoe@email.com',
        type: "Hôtel et logement",
        name:  'John Doe',
        amount: 400,
        date: "2004-04-04",
        vat: "80",
        pct: 20,
        commentary: "Séminaire",
        fileUrl: "../src/fixtures/hotel.jpeg",
        fileName: "Hôtel.jpeg",
        status: 'pending',
        commentAdmin: ''
      }

      const postSpy = jest.spyOn(firebase,"post")
      const newBill = await firebase.post(bill)

      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(newBill.data.length).toBe(1)
    })
  })
})