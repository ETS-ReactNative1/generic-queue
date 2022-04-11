import DatePicker from "react-datepicker";
import cnpjMask from "../../../utils/cnpjMask";
import cpfMask from "../../../utils/cpfMask";
import phoneNumberMask from "../../../utils/phoneNumberMask";
import LocaleComponent from "../../../components/forms/localeComponent";
import PasswordField from "../../../components/forms/passwordField";

const ManagerForm = ({ managerState, setManagerState, formState, setFormState }) => {

  const handleInputChange = event => {
    setManagerState({
      ...managerState,
      [event.target.name]: event.target.value
    });
  };

  const handleDocumentChange = event => {
    const doc = event.target.value.replace(/\D/g, '');
    if (doc.length === 11) {
      setManagerState({
        ...managerState,
        document: cpfMask(doc),
      });
    } else if (doc.length === 14) {
      setManagerState({
        ...managerState,
        document: cnpjMask(doc)
      });
    }
  };

  const handlePhoneChange = event => {
    setManagerState({
      ...managerState,
      phoneNumber: phoneNumberMask(event.target.value),
    });
  };

  const handleDateChange = date => {
    setManagerState({
      ...managerState,
      birthday: date,
    });
  }



  return (
    <form>
      <label htmlFor="name">
        Nome 
        <input
          type="text"
          value={managerState.name}
          onChange={handleInputChange}
          name="name"
          id="name"
          placeholder="Digite seu nome..."
          required
        />
      </label>

      <label htmlFor="email">
        Email 
        <input
          type="text"
          value={managerState.email}
          onChange={handleInputChange}
          name="email"
          id="email"
          placeholder="Digite seu email..."
          required
        />
      </label>

      <label htmlFor="birthday">
        Data de nascimento 
        <DatePicker
          id="birthday"
          name="birthday"
          dateFormat="P"
          locale='pt'
          className="date-field"
          selected={managerState.birthday}
          onChange={handleDateChange}
          required
        />
      </label>

      <label htmlFor="document">
        Documento 
        <input
          type="text"
          value={managerState.document}
          onBlur={handleDocumentChange}
          onChange={handleInputChange}
          name="document"
          id="document"
          placeholder="Digite seu CPF ou CNPJ..."
          required
        />
      </label>
      <div style={{display: 'grid'}}>
        <LocaleComponent data={managerState} setData={setManagerState}
        formState={formState} setFormState={setFormState} />
      </div>

      <label htmlFor="phoneNumber">
        Telefone 
        <input
          maxLength='15'
          type="text"
          value={managerState.phoneNumber}
          onChange={handlePhoneChange}
          name="phoneNumber"
          id="phoneNumber"
          placeholder="(XX) XXXXX-XXXX"
          required
        />
      </label>

      <label htmlFor="old-password">
        Senha antiga
        <PasswordField state={managerState} setState={setManagerState} fieldName={"oldPassword"} />
      </label>

      <label htmlFor="new-password">
        Senha nova
        <PasswordField state={managerState} setState={setManagerState} fieldName={"newPassword"} />
      </label>
    </form>
  )
}

export default ManagerForm;