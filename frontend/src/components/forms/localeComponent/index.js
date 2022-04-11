import searchCep from "../../../utils/searchCep";
import React from "react";
import cepMask from "../../../utils/cepMask";

const LocaleComponent = ({ data, setData, formState, setFormState }) => {
  const handleCepChange = event => {
    setData({
      ...data,
      address: {
        ...data.address,
        cep: cepMask(event.target.value),
      }
    });
  };
  const handleInputChange = event => {
    setData({
      ...data,
      address: {
        ...data.address,
        [event.target.name]: event.target.value
      }
    });
  };

  return (
    <>
      <p style={{ textAlign: '-webkit-center', margin: '0' }}>
        CEP *
      </p>
      <div className="cep">
        <label htmlFor="cep">
          <input
            maxLength='9'
            type="text"
            value={data.address.cep}
            onChange={handleCepChange}
            name="cep"
            id="cep"
            placeholder="Digite seu CEP..."
            required
          />
        </label>
        <button
          disabled={formState.isSearchingCep}
          type="button"
          onClick={() => searchCep(data, setData, formState, setFormState)}
        >
          {formState.isSearchingCep ? (
            "Aguarde..."
          ) : (
            "Buscar"
          )}
        </button>
        {formState.cepErrorMessage && (
          <span className="form-error">{formState.cepErrorMessage}</span>
        )}
      </div>

      <div className="address">
        <label className="address-half" htmlFor="city">
          Cidade *
          <input
            type="text"
            value={data.address.city}
            onChange={handleInputChange}
            name="city"
            id="city"
            placeholder="Digite sua cidade..."
            required
          />
        </label>

        <label className="address-half" htmlFor="state">
          Estado *
          <input
            type="text"
            value={data.address.state}
            onChange={handleInputChange}
            name="state"
            id="state"
            placeholder="Digite seu estado..."
            required
          />
        </label>
      </div>

      <div className="address">
        <label className="address-half" htmlFor="neighborhood">
          Bairro *
          <input
            type="text"
            value={data.address.neighborhood}
            onChange={handleInputChange}
            name="neighborhood"
            id="neighborhood"
            placeholder="Digite seu bairro..."
            required
          />
        </label>

        <label className="address-half" htmlFor="street">
          Rua *
          <input
            type="text"
            value={data.address.street}
            onChange={handleInputChange}
            name="street"
            id="street"
            placeholder="Digite sua rua..."
            required
          />
        </label>
      </div>

      <div className="address">
        <label className="address-text" htmlFor="complement">
          Completemento
          <input
            type="text"
            value={data.address.complement}
            onChange={handleInputChange}
            name="complement"
            id="complement"
            placeholder="Digite um complemento..."
          />
        </label>

        <label className="address-number" htmlFor="number">
          Número *
          <input
            type="number"
            value={data.address.number}
            onChange={handleInputChange}
            name="number"
            id="number"
            placeholder="Digite o número..."
            required
          />
        </label>
      </div>
    </>
  );
}

export default LocaleComponent;