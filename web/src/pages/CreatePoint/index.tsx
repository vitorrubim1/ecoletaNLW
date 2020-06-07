import React, { useEffect, useState, ChangeEvent } from 'react'; //ChangeEvent: MUDANÇA DE UM VALOR AONDE SEJA
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';

import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';

//PRECISO INFORMAR MANUALMENTE OS TIPO QUANDO VEM UM ARRAY OU OBJETO, PRO ESTADO
interface Item {
    id: number,
    title: string,
    image_url: string
}

//UF
interface IBGEUFResponse {
    sigla: string,
}

//CIDADE
interface IBGECityResponse {
    nome: string,
}

const CreatePoint = () => {

    //ARMAZENADO INFORMAÇÕES DENTRO DO COMPONENTE
    const [items, setItems] = useState<Item[]>([]); //'<Item[]>': BUSCANDO DA INTERFACE, E DIZENDO Q VEM UM ARRAY 
    const [ufs, setUfs] = useState<string[]>([]); //UFS, 'string[]' GUARDANDO UM ARRAY DE STRINGS 
    const [cities, setCities] = useState<string[]>([]); //CIDADES 'string[]' GUARDANDO UM ARRAY DE STRINGS

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');

    //PEGANDO OS ITEMS DO BACK
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data); //SETANDO O ESTADO
        });
    }, []);

    //BUSCANDO AS UF DA API DA IBGE
    useEffect(() => {
        axios
            .get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => {

                const ufInitials = response.data.map(uf => uf.sigla); //SIGLA DOS ESTADOS

                setUfs(ufInitials); //SETANDO O ESTADO DE UFS
            });
    }, []);

    //CARREGAR CIDADES
    useEffect(() => {

        if (selectedUf === '0') {
            return;
        }

        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {

                const cityNames = response.data.map(city => city.nome); //NOME DAS CIDADES

                setCities(cityNames); //SETANDO AS CIDADES
            });


    }, [selectedUf]); //PARA MUDAR SEMPRE QUE A UF FOR ALTERADA

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        /*
            'ChangeEvent<HTMLSelectElement>':
                'ChangeEvent': OUVE AS MUDANÇAS DE VALOR DE QUALQUER ATRIBUTO
                '<HTMLSelectElement>': EU DIGO PRA OBSERVAR A MUDANÇA DO SELECT
                E CONSIGO TER ACESSO AO 'event.target.value' 
        */

        const uf = event.target.value;
        setSelectedUf(uf); //SETANDO O ESTADO DE UF COM O ESTADO Q O USER SELECIONOU
    }

    //MESMA COISA DA FUNÇÃO DE CIMA
    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="logo ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>

            <form>
                <h1>Cadastro do <br />ponto de Coleta</h1>

                <fieldset> {/*SEMÂNTICA*/}
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={[-23.4465838, -46.3145073]} zoom={15}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[-23.4465838, -46.3145073]} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                id="uf"
                                value={selectedUf}
                                onChange={handleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione um cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítens de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id}>
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de Coleta</button>
            </form>
        </div>
    );
}

export default CreatePoint;