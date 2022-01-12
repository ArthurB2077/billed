import NewBillUI from "../views/NewBillUI.js"
import {ROUTES} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import {fireEvent, screen} from "@testing-library/dom"
import NewBill from "../containers/NewBill.js"

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))
  document.body.innerHTML = NewBillUI()
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill page, I filled all the form fields and I click on the send button", () => {
    test("Then it should submit the form", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({document, onNavigate, firestore: null, localStorage: window.localStorage})
      const bill = {
        email: 'developpement-test@protonmail.com',
        type: 'Transports',
        name:  'Bateau',
        amount: 40,
        date:  "2021-12-01",
        vat: "60",
        pct: 35,
        commentary: '',
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.appspot.com/o/justificatifs%2F1630071872647.jpg?alt=media&token=0b1420f5-8ae6-4fd8-a5a0-e6a5d87bf931",
        fileName: "unamed.jpg",
        status: 'pending'
      }
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const form = screen.getByTestId('form-new-bill')

      form.addEventListener('submit', handleSubmit)
      jest.fn(() => newBill.createBill(bill))
      fireEvent.submit(form, { currentTarget: form })
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe("When I am on NewBill page, I filled the receipt field with a valid format file", () => {
    test("Then it should change the value of input file by my file", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = {
        storage: {
          ref: jest.fn().mockReturnValue({
            put: jest.fn().mockResolvedValue({
              ref: {
                getDownloadURL: jest.fn().mockResolvedValue(''),
              }
            })
          })
        },
        bills: jest.fn(() => {
          return {
            add : jest.fn().mockResolvedValue('')
          }
        })
      }
      const newBill = new NewBill({
        document, onNavigate, firestore, localStorage: window.localStorage
      })
      const file = new File(["Receipt"], "filename.png", {type: "image/png"})
      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      fileInput.addEventListener('change', handleChangeFile)
      fireEvent.change(fileInput, {target: {files:[file]}})
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })

  describe("When I am on NewBill page, I filled the receipt field with an invalid format file", () => {
    test("Then it should change the value of input file by my file", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = {
        storage: {
          ref: jest.fn().mockReturnValue({
            put: jest.fn().mockResolvedValue({
              ref: {
                getDownloadURL: jest.fn().mockResolvedValue(''),
              }
            })
          })
        },
        bills: jest.fn(() => {
          return {
            add : jest.fn().mockResolvedValue('')
          }
        })
      }
      const newBill = new NewBill({
        document, onNavigate, firestore, localStorage: window.localStorage
      })
      const file = new File(["Receipt"], "filename.json", {type: "application/json"})
      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

      jest.spyOn(window, 'alert').mockImplementation(() => {})
      fileInput.addEventListener('change', handleChangeFile)
      fireEvent.change(fileInput, {target: {files:[file]}})
      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileInput.getAttribute('value')).toBe(null)
      expect(window.alert).toBeCalledWith("Le format du fichier n'est pas accepté. Veuillez importer un fichier de type jpg, jpeg ou png")
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("Then posts bills from mock API POST", async () => {
      const bill = {
        email: 'developpement-test@protonmail.com',
        type: 'Transports',
        name:  'shouldBeFindByExpectStatement',
        amount: 40,
        date:  "2021-12-01",
        vat: "60",
        pct: 35,
        commentary: '',
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.appspot.com/o/justificatifs%2F1630071872647.jpg?alt=media&token=0b1420f5-8ae6-4fd8-a5a0-e6a5d87bf931",
        fileName: "unamed.jpg",
        status: 'pending'
      }

      const onNavigate = (pathname, data = [bill]) => {
        document.body.innerHTML = ROUTES({ pathname, data })
      }

      Object.defineProperty(window, 'firebase', { value: {
          bills: jest.fn(() => {
            return {
              add : jest.fn().mockResolvedValue(bill)
            }
          })
      }})

      const newBill = new NewBill({document, onNavigate, firestore: window.firebase, localStorage: window.localStorage})
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const form = screen.getByTestId('form-new-bill')

      form.addEventListener('submit', handleSubmit)
      jest.fn(() => newBill.createBill(bill))
      fireEvent.submit(form, { currentTarget: form })

      expect(screen.getByText(bill.name)).toBeTruthy()
    })
  })
})
