import {findByRole, screen} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import '@testing-library/jest-dom'
import {ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import firebase from "../__mocks__/firebase.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then, bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I am on Bills page and I click on new bill button", () => {
    test("Then, I should be redirected on send bill form", () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const bill = new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({data: bills})

      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e))

      const buttonNew = screen.getByTestId('btn-new-bill')

      buttonNew.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNew)
      expect(handleClickNewBill).toHaveBeenCalled()

    })
  })
  describe("When I am on Bills page and I click on icon eye button", () => {
    test("Then, a modal showing the receipt should be rendered", () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const bill = new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({data: bills.filter((bill, index) => index === 0)})

      const iconEye = screen.getByTestId('icon-eye')

      const handleClickIconEye = jest.fn(() => bill.handleClickIconEye(iconEye))

      iconEye.addEventListener('click', handleClickIconEye)
      userEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = findByRole(document.body,'dialog')
      expect(modale).toBeTruthy()
    })
  })

  describe("When I am on Bills page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({data: bills, loading: true, error: undefined})
      expect(screen.getByText("Loading...")).toBeTruthy()
    })
  })
  describe("When I am on Bills page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      const error = "Error message"
      document.body.innerHTML = BillsUI({data: bills, loading: undefined, error: error})
      expect(screen.getByTestId("error-message")).toBeTruthy()
    })
  })
})

// Test d'intégration
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
      )
      document.body.innerHTML = BillsUI({error: "Erreur 404"})
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
  })
})
