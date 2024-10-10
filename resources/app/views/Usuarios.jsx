import Encabezado from "../components/Encabezado";
import { useNavigate } from 'react-router-dom'
import useProyect from "../hooks/useProyect";
import useSWR from "swr";
import Cargando from "../components/Cargando";
import clienteAxios from "../config/axios";
import Swal from 'sweetalert2'
import { useEffect, useState } from "react";

export default function Usuarios() {


    const [apiItems, setApiItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([])

    const { filtrado, eliminarUsuario, resetearContraseñaUsuario, changeView } = useProyect();
    const navigate = useNavigate();
    const token = localStorage.getItem('AUTH_TOKEN')

    const fetcher = () => clienteAxios('/api/users', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(data => data.data)

    const { data, error, isLoading, mutate } = useSWR('/api/users', fetcher, {
        revalidateOnFocus: true,
        revalidateIfStale: false,
        revalidateOnReconnect: false
    })

    useEffect(() => {
        const itemsFiltrados = apiItems.filter(item => (
            item.nombreCompleto.toLowerCase().includes(filtrado.toLowerCase())
            || item.ci.toLowerCase().includes(filtrado.toLowerCase())
        ))
        setFilteredItems(itemsFiltrados);
    }, [filtrado])

    useEffect(() => {
        if (!isLoading) {
            setApiItems(data.data)
            setFilteredItems(data.data)
        }
    }, [isLoading, data])

    useEffect(() => {
        changeView('usuarios')
        mutate()
    }, [])
    if (isLoading) return <Cargando />

    const handleDelete = (nombre, id) => {
        Swal.fire({
            title: nombre,
            text: "Esta seguro de querer eliminar al usuario",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, eliminar"
        }).then((result) => {
            if (result.isConfirmed) {
                const mostrarRespuesta = async () => {
                    const respuesta = await eliminarUsuario(id);
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

    const resetearContraseña = (nombre, id) => {
        Swal.fire({
            title: nombre,
            text: "¿Quiere resetear la contraseña?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, resetear"
        }).then((result) => {
            if (result.isConfirmed) {
                const mostrarRespuesta = async () => {
                    const respuesta = await resetearContraseñaUsuario(id);
                    if (Boolean(respuesta)) {
                        Swal.fire({
                            title: "Contraseña reseteada",
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
            <div className="relative overflow-x-auto pt-5">
                <table className="w-full text-sm text-center">
                    <thead className="text-sm uppercase bg-gray-600 text-white">
                        <tr>
                            <th scope="col" className="p-2">
                                Nombre Completo
                            </th>
                            <th scope="col" className="p-2">
                                Tipo de usuario
                            </th>
                            <th scope="col" className="p-2">
                                Carnet de identidad
                            </th>

                            <th scope="col" className="p-2">
                                Foto
                            </th>
                            <th scope="col" className="p-2">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredItems.map(user => (
                                <tr className="bg-white border-b" key={user.id}>
                                    <th scope="row" className="p-2 font-medium">
                                        {user.nombreCompleto}
                                    </th>
                                    <td className="p-2 capitalize">
                                        {user.tipo}
                                    </td>
                                    <td className="p-2 ">
                                        {user.ci}
                                    </td>
                                    <td className="p-2 ">
                                        <img
                                            src={user.imagen}
                                            className="w-8 h-8 rounded-full border-black border-2"
                                        />
                                    </td>
                                    <td className="p-2 ">
                                        <button className="bg-yellow-500 hover:bg-yellow-700 w-8 h-8 rounded-full" onClick={() => {
                                            navigate(`/administrador/usuarios/editar/${user.id}`)
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white mx-auto">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                            </svg>
                                        </button>
                                        <button className="bg-red-500 hover:bg-red-700 w-8 h-8 rounded-full mx-1" onClick={() => handleDelete(user.nombreCompleto, user.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white mx-auto">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                        <button className="bg-green-500 hover:bg-green-700 w-8 h-8 rounded-full" onClick={() => resetearContraseña(user.nombreCompleto, user.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto text-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
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
