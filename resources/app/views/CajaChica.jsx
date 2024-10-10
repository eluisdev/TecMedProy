import { useNavigate } from "react-router-dom";
import Encabezado from "../components/Encabezado";
import Cargando from "../components/Cargando";
import useProyect from "../hooks/useProyect";
import clienteAxios from "../config/axios";
import useSWR from "swr";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2'
import { convertirFechaSinHora } from "../helpers/CajaChica";

export default function CajaChica() {

    const { changeStateModalCajaChica, eliminarGasto, setGastoElegido, filtrado, changeView, idMoneyBox, setIdMoneyBox } = useProyect();
    const navigate = useNavigate();

    const token = localStorage.getItem('AUTH_TOKEN')

    const [apiItems, setApiItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([])
 
    const currentIdMoneyBox = idMoneyBox || '1';

    const urls = [`/api/moneybox/${currentIdMoneyBox}`, `/api/moneyboxes`]

    const fetcher = (urls) => {
        // console.log(urls)
        const f = url => clienteAxios(url,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(data => data.data)
        return Promise.all(urls.map(url => f(url)))
    }

    const { data, error, isLoading, mutate } = useSWR(urls, fetcher, {
        //revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    useEffect(() => {
        const itemsFiltrados = apiItems.filter(item => (
            convertirFechaSinHora(item.created_at).toLowerCase().includes(filtrado.toLowerCase()) || item.descripcion.toLowerCase().includes(filtrado.toLowerCase())
        ))

        setFilteredItems(itemsFiltrados);
    }, [filtrado])

    useEffect(() => {
        if (!isLoading) {
            setApiItems(data[0].spents)
            setFilteredItems(data[0].spents)
        }
    }, [isLoading, data])

    useEffect(() => {
        changeView('caja chica')
        // mutate()
    }, [])

    // useEffect(() => {
    //     mutate(); // Vuelve a cargar los datos cuando idCurrentBox cambia
    // }, [currentIdMoneyBox, mutate]);

    if (isLoading) return <Cargando />

    // console.log(data)
    // console.log(error)

    const cajasChicas = data[1]
    const handleDelete = (nombre, id) => {
        Swal.fire({
            title: nombre,
            text: "Esta seguro de querer eliminar el gasto",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, eliminar"
        }).then((result) => {
            if (result.isConfirmed) {
                const mostrarRespuesta = async () => {
                    const respuesta = await eliminarGasto(id);
                    if (Boolean(respuesta)) {
                        mutate()
                        Swal.fire({
                            title: "Eliminado!",
                            text: respuesta,
                            icon: "success"
                        });
                    } else {
                        Swal.fire({
                            icon: "Error",
                            title: "Oops...ocurrio un error",
                            text: "Fallo en el servidor!",
                        });
                    }

                }
                mostrarRespuesta();
            }
        });
    };

    return (
        <>
            <Encabezado />
            <div className="flex md:flex-row md:gap-0 flex-col gap-1 items-center justify-around text-xl bg-blue-950 text-white p-2 mt-2 rounded-lg">
                <p>Dinero total: <span className="font-bold text-yellow-400">1000 Bs.</span></p>
                <p>Dinero disponible: <span className="font-bold text-yellow-400">{data[0].saldo} Bs.</span></p>
                <p>Dinero gastado: <span className="font-bold text-yellow-400">{data[0].gasto} Bs.</span></p>
                <select onChange={(e) => {
                    setIdMoneyBox(e.target.value)
                }}
                    className="bg-blue-500 hover:bg-blue-700 rounded-lg font-bold text-white p-2 text-sm" value={idMoneyBox || '1'}>
                    {
                        cajasChicas.map(cajaChica => (
                            <option key={cajaChica.id} value={cajaChica.id}>{cajaChica.nombre}</option>
                        ))
                    }
                </select>
            </div>

            <div className="relative overflow-x-auto mt-3 max-w-full">
                <table className="w-full text-sm text-center mx-auto">
                    <thead className="uppercase bg-gray-600 text-white">
                        <tr>
                            <th scope="col" className="p-2">
                                Nro
                            </th>
                            <th scope="col" className="p-2">
                                Fecha
                            </th>
                            <th scope="col" className="p-2">
                                Gasto
                            </th>
                            <th scope="col" className="p-2">
                                Custodio
                            </th>
                            <th scope="col" className="p-2">
                                Factura
                            </th>
                            <th scope="col" className="p-2">
                                Descripción
                            </th>
                            <th scope="col" className="p-2">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="">
                        {
                            filteredItems?.map(gasto => (
                                <tr className="bg-white border-b text-sm" key={gasto.id}>
                                    <td className="font-bold p-1 bg-slate-100">
                                        {gasto.nro}
                                    </td>
                                    <th scope="row" className="p-1 font-medium">
                                        {convertirFechaSinHora(gasto.created_at)}
                                    </th>
                                    <td className="p-1">
                                        {gasto.gasto} Bs.
                                    </td>
                                    <td className="p-1">
                                        {gasto.interested}
                                    </td>
                                    <td className="p-1">
                                        {gasto.nroFactura || 'Sin número de factura'}
                                    </td>
                                    <td className="p-1 max-w-2xl">
                                        {gasto.descripcion}
                                    </td>
                                    <td className="p-1">
                                        <button
                                            className="bg-blue-700 hover:bg-blue-900 w-8 h-8 rounded-full"
                                            onClick={() => {
                                                changeStateModalCajaChica()
                                                setGastoElegido({ ...gasto, director: data[0].director, manager: data[0].manager, nombreGasto: gasto.nombre })
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white mx-auto">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                            </svg>
                                        </button>
                                        <button className="bg-yellow-500 hover:bg-yellow-700 w-8 h-8 rounded-full sm:mx-1" onClick={() => {
                                            navigate(`/administrativo/caja-chica/editar/${gasto.id}`)
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white mx-auto">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                            </svg>
                                        </button>
                                        <button className="bg-red-500 hover:bg-red-700 w-8 h-8 rounded-full" onClick={() => handleDelete(gasto.nombre, gasto.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white mx-auto">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}
