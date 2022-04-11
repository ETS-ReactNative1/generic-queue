import React, { useContext } from "react";
import { navigate, A, useTitle } from "hookrouter";
import { registerLocale } from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import pt from 'date-fns/locale/pt-BR';
import { login } from "../../hooks/auth";
import AuthContext from '../../hooks/auth';

import './index.css';
import ManagerForm from "./components/ManagerForm";
import StoreForm from "./components/StoreForm";
import axios from "axios";
import cpfValidator from "../../utils/cpfValidator";
import cnpjValidator from "../../utils/cnpjValidator";
import { createStore, validateUser } from "../../services/AuthService";
import Loader from "react-loader-spinner";

registerLocale('pt', pt);

export const SignUp = () => {
  useTitle('Cadastro');

  const { setIsSigned } = useContext(AuthContext);

  const initialManagerState = {
    name: "",
    email: "",
    birthday: new Date(),
    document: "",
    address: {
      cep: "",
      state: "",
      city: "",
      street: "",
      neighborhood: "",
      number: "",
      complement: "",
    },
    phoneNumber: "",
    password: "",
  };

  const initialStoreState = {
    photoUri: "",
    name: "",
    email: "",
    phoneNumber: "",
    address: {
      cep: "",
      state: "",
      city: "",
      street: "",
      neighborhood: "",
      number: "",
      complement: "",
    },
    cnpj: "",
    status: [
      { isCancelable: true, isDeleteable: false, value: "AGENDADO", label: "Agendado" },
      { isCancelable: true, isDeleteable: true, value: "PROCESSANDO", label: "Processando" },
      { isCancelable: false, isDeleteable: false, value: "FINALIZADO", label: "Finalizado" },
      { isCancelable: false, isDeleteable: false, value: "CANCELADO", label: "Cancelado" },
    ],
  }

  const initialFormState = {
    imgChanged: false,
    isSubmitting: false,
    errorMessage: null,
    isSearchingCep: false,
    cepErrorMessage: null
  }

  const [managerState, setManagerState] = React.useState(initialManagerState);
  const [storeState, setStoreState] = React.useState(initialStoreState);
  const [formState, setFormState] = React.useState(initialFormState);
  const [page, setPage] = React.useState(1);

  const testManagerFields = async () => {
    if (!managerState.password.trim().length || !managerState.email.trim().length || !managerState.name.trim().length
      || !managerState.birthday || !managerState.document.trim().length || !managerState.address.cep.trim().length ||
      !managerState.address.city.trim().length || !managerState.address.state.trim().length
      || !managerState.address.neighborhood.trim().length
      || !managerState.address.street.trim().length || !managerState.address.number.trim().length) {
      return "Complete todos os campos marcados com *";
    }

    if (managerState.password.length <= 6) {
      return "Senha deve ser maior que 6 caracteres";
    }

    if (managerState.phoneNumber.length !== 15) {
      return "Número de telefone inválido";
    }

    const currentDate = new Date();
    let age = currentDate.getFullYear() - managerState.birthday.getFullYear();
    const m = currentDate.getMonth() - managerState.birthday.getMonth();
    if (m < 0 || (m === 0 && currentDate.getDate() < managerState.birthday.getDate())) {
      age--;
    }

    if (age <= 16) {
      return "Apenas usuários maiores de 16 anos podem se cadastrar";
    }
    try {
      await validateUser(managerState);
    } catch (error) {
      if (error.response.data)
        return error.response.data;
      else
        return "Usuário já cadastrado";
    }

    const doc = managerState.document.replace(/\D/g, '');
    if ((doc.length === 11 && !cpfValidator(managerState.document)) ||
      (doc.length === 14 && !cnpjValidator(managerState.document))) {
      return "Documento inválido";
    }
  }

  const testStoreFields = async () => {
    if (storeState.email.trim().length === 0 || storeState.name.trim().length === 0 || storeState.cnpj.trim().length === 0
      || storeState.address.cep.trim().length === 0 || storeState.address.city.trim().length === 0
      || storeState.address.state.trim().length === 0
      || storeState.address.neighborhood.trim().length === 0 || storeState.address.street.trim().length === 0
      || storeState.address.number.trim().length === 0) {
      return "Complete todos os campos marcados com *";
    }

    if (storeState.phoneNumber.length !== 15) {
      return "Número de telefone inválido";
    }

    try {
      const _cep = storeState.address.cep.replace("-", "");
      const res = await axios.get(`https://viacep.com.br/ws/${_cep}/json/`);
      if (res.data.erro) {
        return "CEP não encontrado";
      }
    } catch (error) {
      return "CEP não encontrado";
    }
    if (!cnpjValidator(storeState.cnpj)) {
      return "CNPJ inválido";
    }
  }


  const nextPage = async event => {
    event.preventDefault();
    setFormState({
      ...formState,
      isSubmitting: true,
      errorMessage: ''
    })
    const errorMessage = await testManagerFields();
    if (errorMessage) {
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: errorMessage
      });
    }
    else {
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: ""
      });
      setPage(2);
    }
  }

  const handleFormSubmit = async event => {
    event.preventDefault();
    setFormState({
      ...formState,
      isSubmitting: true,
      errorMessage: ''
    });
    const errorMessage = await testStoreFields();
    if (errorMessage) {
      setFormState({
        ...formState,
        isSubmitting: false,
        errorMessage: errorMessage
      });
    }

    const { _id, ...store } = {
      ...storeState,
      photoUri: formState.imgChanged ? storeState.photoUri : '',
    }
    store.status.forEach(sts => delete sts.label);

    const dataDto = { store, manager: managerState };

    try {
      const res = await createStore(dataDto);
      if (res.status === 200) {
        login(res.data);
        setIsSigned(true);
        navigate('/home');
      }
      else {
        navigate('/login');
      }
    } catch (error) {
      if (error.response.status === 400) {
        setFormState({
          ...formState,
          isSubmitting: false,
          errorMessage: `Erro! ${error.response.data}`
        });
      }
      else {
        setFormState({
          ...formState,
          isSubmitting: false,
          errorMessage: `Erro! ${error.response.data}`
        });
      }
    }
  };

  return (
    <>
      <Loader
        type="Puff"
        color="#00BFFF"
        className="loader"
        height={100}
        width={100}
        visible={formState.isSubmitting}
      />
      <div className="signup-container">
        <div className="card-store">
          <div className="container">
            {page === 1 && <ManagerForm data={managerState} setData={setManagerState}
              formState={formState} setFormState={setFormState} />}
            {page === 2 && <StoreForm data={storeState} setData={setStoreState}
              formState={formState} setFormState={setFormState} />}
            <div style={{ textAlign: "-webkit-center" }}>
              <>
                {formState.errorMessage && (
                  <span className="form-error">{formState.errorMessage}</span>
                )}
                <div className="signup-btn">
                  <button disabled={formState.isSubmitting}
                    onClick={page === 1 ? nextPage : handleFormSubmit}>
                    {formState.isSubmitting ? (
                      "Carregando..."
                    ) : page === 1 ? "Seguinte" : "Criar"}
                  </button>
                </div>
              </>
              {page === 2 &&
                <>
                  <br />
                  <a onClick={() => setPage(1)}> {'<'} Voltar</a>
                </>
              }
              <hr />
              <A href='/login'>Já possui uma conta?</A>
            </div>


          </div>
        </div>
      </div>
    </>
  );
};
export default SignUp;