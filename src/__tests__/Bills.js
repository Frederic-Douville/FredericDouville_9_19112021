import { fireEvent, getByTestId, screen } from "@testing-library/dom"
import { toHaveClass, toHaveAttribute, tohaveStyle } from "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import Firestore from "../app/Firestore"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import Router from "../app/Router.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"



describe("Given I am connected as an employee", () => {
  //Tests sur BillsUI
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {       
          
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      jest.fn(Firestore)
      Firestore.bills = () => { return {get: jest.fn().mockResolvedValue(bills)}}
      
      Object.defineProperty(window, 'location', {
        value:{
          hash: ROUTES_PATH['Bills']
        }})
      
      document.body.innerHTML = '<div id="root"></div>'      
      jest.fn(Router())     
      
      const billIcon = screen.getByTestId("icon-window")
      expect(billIcon).toBeTruthy()    
      const billIconClass = document.getElementsByClassName("active-icon")     
      expect(billIconClass).toBeTruthy()
      expect(billIcon).toHaveClass("active-icon")    
      
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })    
  })
  describe('When I am on Bills Page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
        const html = BillsUI({ loading: true })
        document.body.innerHTML = html
        expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Bills Page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
        const html = BillsUI({ error: 'some error message' })
        document.body.innerHTML = html
        expect(screen.getAllByText('Erreur')).toBeTruthy()
    })   
  })

  //Test sur Bills
  describe('When I am on Bills Page and I click on new bill button', () => {
    test('Then a new bill form appears', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))       
         
      const firestore = null
      const bill = new Bills({
        document, onNavigate, firestore, localStorage: window.localStorage
      })
      
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e))
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click',handleClickNewBill)
      userEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()
    })
  })

  describe('When I am on Bills Page ans I click on icon eye', () => {
    test('Then a picture modal appears', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const firestore = null
      const bill = new Bills({
        document, onNavigate, firestore, localStorage: window.localStorage
      })

      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
    
      const handleClickIconEye = jest.fn((icon) => bill.handleClickIconEye(icon))
      
      const iconEye = screen.getAllByTestId('icon-eye')
      Array.prototype.forEach.call(iconEye, el => el.addEventListener('click',handleClickIconEye(el)))
      const firstIconEye = iconEye[0]           
      userEvent.click(firstIconEye)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = screen.getAllByText('Justificatif')
      expect(modale).toBeTruthy()

      expect(firstIconEye).toHaveAttribute('data-bill-url')
    })
  })  
})

//Test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test('Test to get Bills from data', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))      
       
      const data = await firebase.get()      

      const bill = jest.fn( new Bills({
        document, onNavigate, firestore: data, localStorage: window.localStorage
      }))     
      
      expect(bill).toBeTruthy()      
    })   
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
//mocker locale storage et intégrer firestore et tester l33 à 63 (voir login.js)
//faire un appel à getBills()
