import { useNavigate, useParams } from "react-router-dom";
import useProyect from "../hooks/useProyect";
import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";

import Cargando from "./Cargando";
import clienteAxios from "../config/axios";
import Alerta from './Alerta.jsx';
export default function FormularioCajaChica() {

    const { cargando, editarGasto, crearGasto, idMoneyBox} = useProyect();
    const params = useParams();
    const { id } = params
    const navigate = useNavigate();
    const { mutate } = useSWRConfig()

    const [errores, setErrores] = useState([])

    const [ingreso, setIngreso] = useState('no');
    const [costo, setCosto] = useState(0.00);
    const [nro, setNro] = useState('');
    const [nroFactura, setNroFactura] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [entidad, setEntidad] = useState('')
    const [cantidad, setCantidad] = useState(1)

    let urls = []

    if (id) {
        urls = [`/api/spents/${id}`]
    } else {
        urls = [`/api/spents/nroVale/${idMoneyBox || '1'}`]
    }
    // console.log(urls)
    const token = localStorage.getItem('AUTH_TOKEN')
    const fetcher = (urls) => {
        const f = url => clienteAxios(url,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(data => data.data)
        return Promise.all(urls.map(url => f(url)))
    }

    const { data, error, isLoading } = useSWR(urls, fetcher)

    const handleSubmit = async (e) => {
        let resultado = false
        e.preventDefault()

        const datos = {
            gasto: costo,
            nro,
            ingreso,
            nroFactura: nroFactura || 'Sin factura',
            descripcion,
            custodio: entidad,
            idMoneyBox: idMoneyBox || '1',
            cantidad
        }

        //console.log(datos)
        if (id) {
            resultado = await editarGasto(datos, setErrores, id)
        } else {
            resultado = await crearGasto(datos, setErrores);
        }
        if (resultado) {
            navigate('/administrativo/caja-chica');
            mutate('/api/moneybox')
        }
    }
    useEffect(() => {
        if (id && !isLoading) {
            setCosto(data[0].gasto)
            setNro(data[0].nro)
            setIngreso(data[0].ingreso)
            setNroFactura(data[0].nroFactura || '')
            setDescripcion(data[0].descripcion)
            setEntidad(data[0].interested)
            setCantidad(data[0].cantidad)
        }

    }, [isLoading, data])

    useEffect(() => {
        if (Boolean(id) === false && !isLoading) {
            setNro(data[0].nro);
        }

    }, [isLoading, data])

    if (isLoading) return <Cargando />

    return (
        <>
            <form className="max-w-[500px] w-full mx-auto mt-5 bg-gray-900 p-6 rounded-lg" onSubmit={handleSubmit}>
                {errores ? errores.map((error, i) => <Alerta key={i}>{error}</Alerta>) : null}
                <div className="flex flex-col text-gray-400">
                    <label className="text-gray-200 font-bold" htmlFor="costo">Costo (Bs.)</label>
                    <input className="rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none text-white" type="number" step="any" id="costo" placeholder="Ej. 812512" value={costo} onChange={e => setCosto(e.target.value)} />
                </div>
                {/* {
                    id && (
                        <>
                            <div className="flex items-center justify-around text-gray-400 py-2">
                                <label className="font-bold text-white block">Habilitar Ingreso</label>
                                <div className="flex items-center gap-1 justify-center">
                                    <label className="text-gray-200" htmlFor="si">Si
                                    </label>
                                    <input
                                        className="rounded-lg bg-gray-500 focus:border-blue-500 focus:bg-gray-800 focus:outline-none h-4 w-4 "
                                        type="checkbox"
                                        value={'si'}
                                        checked={ingreso === 'si'}
                                        id='si'
                                        onChange={e => setIngreso(e.target.value)} />
                                </div>
                                <div className="flex items-center gap-1 justify-center">
                                    <label className="text-gray-200" htmlFor="no">No
                                    </label>
                                    <input
                                        className="rounded-lg bg-gray-700 focus:border-blue-500 focus:bg-gray-800 focus:outline-none text-white h-4 w-4"
                                        type="checkbox"
                                        value={'no'}
                                        checked={ingreso === 'no'}
                                        id="no"
                                        onChange={e => setIngreso(e.target.value)} />
                                </div>
                            </div>
                        </>
                    )
                } */}

                <div className="flex flex-col text-gray-400 mt-2">
                    <label className="text-gray-200 font-bold" htmlFor="nrogasto">Nro de Comprobante</label>
                    <input className="rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none text-white" type="text" id="nrogasto" placeholder="Ej. 812512" value={nro} onChange={e => setNro(e.target.value)} />
                </div>
                <div className="flex flex-col text-gray-400 mt-2">
                    <label className="text-gray-200 font-bold" htmlFor="cantidad">Cantidad</label>
                    <input className="rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none text-white" type="text" id="cantidad" placeholder="Ej. 812512" value={cantidad} onChange={e => setCantidad(e.target.value)} />
                </div>
                <div className="flex flex-col text-gray-400 py-2">
                    <label className="text-gray-200 font-bold" htmlFor="user">Nro de factura</label>
                    <input className="rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none text-white" type="text" id="user" placeholder="Ej. 812512" value={nroFactura} onChange={e => setNroFactura(e.target.value)} />
                </div>
                <div className="flex flex-col text-gray-400 py-1">
                    <label className="text-gray-200 font-bold" htmlFor="custodio">Custodio</label>
                    <input className="rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none text-white" type="text" id="custodio" placeholder="Ej. Walter Bustillos" value={entidad} onChange={e => setEntidad(e.target.value)} />

                    {/* <select className='rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none text-white' id="custodio" value={entidad} onChange={e => setEntidad(e.target.value)}>
                        <option value={""}>Elige quien recibira el dinero</option>
                        {
                            interesteds?.map(({ nombreCompleto, id }) => (
                                <option value={id} key={id}>{nombreCompleto}</option>
                            ))
                        }
                    </select> */}
                </div>
                <div className="flex flex-col text-gray-400 py-2">
                    <label className="text-gray-200 font-bold" htmlFor="descripcion">Descripción</label>
                    <textarea
                        className='rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none text-white' id='descripcion'
                        value={descripcion} onChange={e => setDescripcion(e.target.value)}
                    />
                </div>
                <button className="w-full mt-5 py-3 bg-blue-500 shadow-lg  hover:bg-blue-600 text-white font-bold rounded-lg" disabled={cargando}>{id ? 'Guardar cambios' : 'Crear gasto'}</button>
            </form>
        </>
    )
}
