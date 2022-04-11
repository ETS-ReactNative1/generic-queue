import axios from "axios";

const searchCep = async (data, setData, formState, setFormState) => {
  if (data.address.cep.length < 9) {
    setFormState({
      ...formState,
      cepErrorMessage: "Tamanho inválido de CEP"
    });
    return;
  }
  setFormState({
    ...formState,
    isSearchingCep: true,
    cepErrorMessage: ""
  });
  const _cep = data.address.cep.replace("-", "");
  try {
    const res = await axios.get(`https://viacep.com.br/ws/${_cep}/json/`);
    if (res.data.erro) {
      setFormState({
        ...formState,
        isSearchingCep: false,
        cepErrorMessage: "CEP não encontrado"
      });
    }
    else {
      const { bairro, localidade, logradouro, uf } = res.data;
      const newData = {
        ...data,
        address: {
          ...data.address,
          neighborhood: bairro,
          city: localidade,
          state: uf,
          street: logradouro,
        }
      };
      setData(newData);
      setFormState({
        ...formState,
        isSearchingCep: false,
        cepErrorMessage: ""
      });
    }

  } catch (error) {
    console.log(error);
    setFormState({
      ...formState,
      isSearchingCep: false,
      cepErrorMessage: error.response
    });
  }
}

export default searchCep;