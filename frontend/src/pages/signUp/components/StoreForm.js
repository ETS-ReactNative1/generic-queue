
import cnpjMask from "../../../utils/cnpjMask";
import phoneNumberMask from "../../../utils/phoneNumberMask";
import defaultPhoto from '../../../assets/store.png'
import LocaleComponent from "../../../components/forms/localeComponent";
import SelectSatus from "../../../components/forms/selectStatus";

const ManagerForm = ({ data, setData, formState, setFormState }) => {
  const handleInputChange = event => {
    setData({
      ...data,
      [event.target.name]: event.target.value
    });
  };

  const handleCnpjChange = event => {
    setData({
      ...data,
      cnpj: cnpjMask(event.target.value),
    });
  };

  const handlePhoneChange = event => {
    setData({
      ...data,
      phoneNumber: phoneNumberMask(event.target.value),
    });
  };

  const photoUpload = e => {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      setData({
        ...data,
        photoUri: reader.result
      });
      setFormState({
        ...formState,
        imgChanged: true
      });
    }
    reader.readAsDataURL(file);
  }

  const showImageOrDefault = (image) => image && image.startsWith("data:image") ? image : defaultPhoto

  return (
    <form>
      <h1>Cadastrar Loja</h1>

      <div className="align-photo store-photo">
        <label htmlFor="photoUri">
          <div style={{ marginBottom: '6px' }}>
            Foto
          </div>
          <div style={{ width: 'fit-content' }} className="custom-file-upload">
            <div className='img-wrap img-upload img-upload-hover' >
              <img htmlFor="photoUri" src={showImageOrDefault(data.photoUri)} alt="Foto do item" />
            </div>
            <input
              className="input-manage"
              id="photoUri"
              type="file"
              onChange={photoUpload} />
          </div>
        </label>
      </div>

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

      <label htmlFor="cnpj">
        CNPJ *
        <input
          maxLength='18'
          type="text"
          value={data.cnpj}
          onChange={handleCnpjChange}
          name="cnpj"
          id="cnpj"
          placeholder="Digite o CNPJ da empresa..."
          required
        />
      </label>
      <SelectSatus data={data} setData={setData} />
      <div style={{ display: 'grid' }}>
        <LocaleComponent data={data} setData={setData}
          formState={formState} setFormState={setFormState} />

      </div>

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
    </form>
  )
}

export default ManagerForm;