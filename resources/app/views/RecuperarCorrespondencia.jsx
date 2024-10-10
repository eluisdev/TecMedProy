import { useNavigate } from "react-router-dom";
import Encabezado from "../components/Encabezado";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import useProyect from "../hooks/useProyect";
import Cargando from "../components/Cargando";
import Swal from "sweetalert2";
import { convertirFecha } from "../helpers/CajaChica";
import { useEffect } from "react";

export default function RecuperarCorrespondencia() {

  const { recuperarCorrespondencia, confirmarEliminarCorrespondencia, changeView } = useProyect();

  const token = localStorage.getItem('AUTH_TOKEN')

  const fetcher = () => clienteAxios('/api/correspondences/recover', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(data => data.data)

  const { data, error, isLoading,  mutate } = useSWR('/api/correspondences/recover', fetcher, {
    revalidateOnFocus: true,
    revalidateIfStale: false,
    revalidateOnReconnect: false
  })

  useEffect(() => {
    changeView('correspondencia eliminada')
    mutate()
  }, [])

  if (isLoading) return <Cargando />
  const correspondencias = data.data
  const handleDelete = (nombre, id) => {
    Swal.fire({
      title: nombre,
      text: "Eliminar definitamente la correspondencia, esta seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, confirmar"
    }).then((result) => {
      if (result.isConfirmed) {
        const mostrarRespuesta = async () => {
          const respuesta = await confirmarEliminarCorrespondencia(id);

          if (Boolean(respuesta)) {
            mutate()
            Swal.fire({
              title: "Se realizo con exito!",
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

  const handleRecover = (nombre, id) => {
    Swal.fire({
      title: nombre,
      text: "Recuperar la correspondencia, esta seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, confirmar"
    }).then((result) => {
      if (result.isConfirmed) {
        const mostrarRespuesta = async () => {
          const respuesta = await recuperarCorrespondencia(id);
          mutate()
          if (Boolean(respuesta)) {
            Swal.fire({
              title: "Se realizo con exito!",
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
      <div className="flex max-lg:flex-col max-lg:gap-3 items-center justify-between p-3 rounded-lg shadow-2xl bg-white">
        <div className="flex max-lg:flex-col max-lg:gap-3 items-center justify-between w-full lg:mr-5">
          <p className="font-black md:text-4xl text-3xl text-blue-950 capitalize md:mr-3 text-center">Correspondencia Eliminada</p>
        </div>
      </div>
      <div className="relative overflow-x-auto pt-5">
        <table className="w-4/5 text-sm text-center mx-auto">
          <thead className="text-sm uppercase bg-gray-600 text-white">
            <tr>
              <th scope="col" className="p-2">
                Nombre
              </th>
              <th scope="col" className="p-2">
                Tipo correspondencia
              </th>
              <th scope="col" className="p-2">
                Fecha Creación
              </th>
              <th scope="col" className="p-2">
                Unidad
              </th>
              <th scope="col" className="p-2">
                Observaciones
              </th>
              <th scope="col" className="p-2">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {
              correspondencias?.map(correspondencia => (
                <tr className="bg-white border-b" key={correspondencia.id}>
                  <th scope="row" className="p-2 font-medium">
                    {correspondencia.nombre}
                  </th>
                  <th scope="row" className="p-2 font-medium">
                    {correspondencia.tipo}
                  </th>
                  <th scope="row" className="p-2 font-medium">
                    {convertirFecha(correspondencia.fechaCreacion)}
                  </th>
                  <th scope="row" className="p-2 font-medium">
                    {correspondencia.unit.nombre}
                  </th>
                  <th scope="row" className="p-2 font-medium">
                    {correspondencia.descripcion}
                  </th>
                  <td className="p-2">
                    <button className="bg-green-500 hover:bg-green-700 w-8 h-8 rounded-full mr-1" onClick={() => handleRecover(correspondencia.nombre, correspondencia.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white mx-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button className="bg-red-500 hover:bg-red-700 w-8 h-8 rounded-full" onClick={() => handleDelete(correspondencia.nombre, correspondencia.id)}>
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
