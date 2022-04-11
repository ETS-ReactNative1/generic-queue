import DatePicker from "react-datepicker";
import cnpjMask from "../../../utils/cnpjMask";
import cpfMask from "../../../utils/cpfMask";
import phoneNumberMask from "../../../utils/phoneNumberMask";
import LocaleComponent from "../../../components/forms/localeComponent";
import PasswordField from "../../../components/forms/passwordField";

const ManagerForm = ({ data, setData, formState, setFormState }) => {

  const handleInputChange = event => {
    setData({
      ...data,
      [event.target.name]: event.target.value
    });
  };

  const handleDocumentChange = event => {
    const doc = event.target.value.replace(/\D/g, '');
    if (doc.length === 11) {
      setData({
        ...data,
        document: cpfMask(doc),
      });
    } else if (doc.length === 14) {
      setData({
        ...data,
        document: cnpjMask(doc)
      });
    }
  };

  const handlePhoneChange = event => {
    setData({
      ...data,
      phoneNumber: phoneNumberMask(event.target.value),
    });
  };

  const handleDateChange = date => {
    setData({
      ...data,
      birthday: date,
    });
  }



  return (
    <form>
      <h1>Cadastrar Gerente</h1>

      <label htmlFor="name">
        Nome *
        <input
          type="text"
          value={data.name}
          onChange={handleInputChange}
          name="name"
          id="name"
          placeholder="Digite seu nome..."
          required
        />
      </label>

      <label htmlFor="email">
        Email *
        <input
          type="text"
          value={data.email}
          onChange={handleInputChange}
          name="email"
          id="email"
          placeholder="Digite seu email..."
          required
        />
      </label>

      <label htmlFor="birthday">
        Data de nascimento *
        <DatePicker
          id="birthday"
          name="birthday"
          dateFormat="P"
          locale='pt'
          className="date-field"
          selected={data.birthday}
          onChange={handleDateChange}
          required
        />
      </label>

      <label htmlFor="document">
        Documento *
        <input
          type="text"
          value={data.document}
          onBlur={handleDocumentChange}
          onChange={handleInputChange}
          name="document"
          id="document"
          placeholder="Digite seu CPF ou CNPJ..."
          required
        />
      </label>

      <LocaleComponent data={data} setData={setData}
       formState={formState} setFormState={setFormState} />

      <label htmlFor="phoneNumber">
        Telefone *
        <input
          maxLength='15'
          type="text"
          value={data.phoneNumber}
          onChange={handlePhoneChange}
          name="phoneNumber"
          id="phoneNumber"
          placeholder="(XX) XXXXX-XXXX"
          required
        />
      </label>

      <label htmlFor="password">
        Senha *
        <PasswordField state={data} setState={setData} />
      </label>
    </form>
  )
}

export default ManagerForm;