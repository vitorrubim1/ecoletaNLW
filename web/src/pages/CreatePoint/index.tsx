import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'; //ChangeEvent: MUDANÇA DE UM VALOR AONDE SEJA, FormEvent: FORMULARIO
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent, Evented } from 'leaflet';
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

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]); //LATITUDE E LONGITUDE, E DIGO Q VEM ARRAY DE NUMEROS

    const [formData, setFormaData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]); //ARRAY DE NÚMEROS
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => { //POSIÇÃO INICIAL DO USUÁRIO, DA ONDE ELE ESTÁ
            // console.log(position);

            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]); //SETANDO A POSIÇÃO INICIAL
        });
    }, []);

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

    //CARREGAR CIDADES COM API DO IBGE
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
    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    //PARA ESCOLHER LOCALIDADE PELO MAPA
    function handleMapCity(event: LeafletMouseEvent) {
        // console.log(event.latlng); //LATITUDE DE LONGITUDE QUE FOI CLICADA

        setSelectedPosition([ //SETANDO O ESTADO
            event.latlng.lat, //LATITUDE
            event.latlng.lng, //LONGITUDE
        ])
    }

    //PARA PEGAR INFORMAÇÕES DO INPUTS E SETAR EM UM ESTADO
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        // console.log(event.target); 

        const { name, value } = event.target; //NOME E VALOR DO INPUT

        setFormaData({ ...formData, [name]: value }); //E AQ SETO O ESTADO, COPIANDO O VALOR Q JA TEM, INCLUINDO UM NOVO
    }

    function handleSelectItem(id: number){
        // console.log("teste", id);        

        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0){
            //REMOVO O ITEM
            const filteredItems = selectedItems.filter(item => item !== id);

            setSelectedItems(filteredItems); //SETO O ESTADO SEM O ITEM QUE FOI DESELECIONADO
        } else {
            setSelectedItems([ ...selectedItems, id ]); //PARA PODER SELECIONAR MAIS DE UM ITEM, INCLUINDO AO QUE JA TEM
        }

        /*
            PEGO TODO O ARRAY(state):'selectedItems',
                'findIndex': RETORNA UM NÚMERO >= 0, SE JÁ TIVER DENTRO DO ARRAY, SE NÃO -1;
                'item => item === id' EU PERCORRO O ARRAY, E VEJO SE TEM ALGUM ITEM IGUAL AO ID, QUE VEIO COMO PARAMETRO
        */     
    }

    //CADASTRANDO INFORMAÇÕES
    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        //INFORMAÇÕES DE DENTRO DOS ESTADOS
        const { name, email, whatsapp } = formData; 
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email, 
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }   

        // console.log(data);

        await api.post('points', data);
       
        alert('Ponto de coleta criado!!');

        history.push('/');
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

            <form onSubmit={handleSubmit}>
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
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    {/* MAPA */}
                    <Map
                        center={initialPosition}
                        zoom={15}
                        onclick={handleMapCity}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
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
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)} 
                                className={selectedItems.includes(item.id) ? 'selected': ''} //AQ EU VEJO SE NO ESTADO JA TEM O ID DO ITEM, SE JÁ TIVER SIDO, PONHO UMA CLASSE
                            >
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