import { useNavigate, useParams } from "react-router-dom";
import useProyect from "../hooks/useProyect";
import { useEffect, useState } from "react";
import clienteAxios from "../config/axios";
import useSWR from "swr";
import Cargando from "./Cargando";
import Alerta from "./Alerta";

export default function FormularioUnidad() {

  const { editarUnidad, crearUnidad, cargando } = useProyect()
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [area, setArea] = useState('')
  const [errores, setErrores] = useState([])

  const token = localStorage.getItem('AUTH_TOKEN')

  const fetcher = () => (
    clienteAxios(`/api/units/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  )

  const { data, error, isLoading, mutate } = useSWR(() => id ? `/api/units/${id}` : null, fetcher, {
    revalidateOnFocus: true,
    revalidateIfStale: false,
    revalidateOnReconnect: false
  })

  useEffect(() => {
    if (id && !isLoading) {
      setNombre(data.data.nombre)
      setArea(data.data.area)
    }
  }, [isLoading, data])

  const handleSubmit = async (e) => {
    let resultado = false
    e.preventDefault()
    const datos = {
      nombre,
      area
    }
    if (id) {
      resultado = await editarUnidad({ ...datos, id }, setErrores)
    } else {
      resultado = await crearUnidad(datos, setErrores)
    }

    if (resultado) {
      navigate('/administrador/unidades');
    }
  }

  useEffect(()=>{
    mutate()
  },[])
  if (isLoading) return <Cargando />
  return (
    <>
      <form className="max-w-[500px] w-full mx-auto mt-5 bg-gray-900 px-5 py-2 rounded-lg" onSubmit={handleSubmit}>
        {errores ? errores.map((error, i) => <Alerta key={i}>{error}</Alerta>) : null}
        <div className="flex flex-col text-gray-400 py-2">
          <label className="text-gray-200 font-bold" htmlFor="user">Nombre de unidad</label>
          <input className="rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none text-white" type="text" id="user" placeholder="Ej. Reunion de delegados" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>

        <div className="flex flex-col text-gray-400 py-1">
          <label className="text-gray-200 font-bold" htmlFor="area">Area</label>
          <select className='rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none text-white' value={area} onChange={e => {
            setArea(e.target.value)
          }} name='area' id='area'>
            <option value={""}>Elige un area</option>
            <option value={"Area central"}>Area central</option>
            <option value={"Bibliotecas"}>Bibliotecas</option>
            <option value={"Carreras"}>Carreras</option>
            <option value={"Facultades"}>Facultades</option>
            <option value={"Institucion externa"}>Institucion externa</option>
            <option value={"Institutos"}>Institutos</option>
            <option value={"Proyectos"}>Proyectos</option>
            <option value={"Unidad de posgrado"}>Unidad de posgrado</option>
            <option value={"Unidad externa"}>Unidad externa</option>
            <option value={"Externo central"}>Externo Central</option>
          </select>
        </div>

        <button className="w-full my-5 py-3 bg-blue-500 shadow-lg  hover:bg-blue-600 text-white font-semibold rounded-lg" disabled={cargando}>{id ? 'Guardar cambios' : 'Crear unidad'}</button>
      </form>
    </>
  )
}
