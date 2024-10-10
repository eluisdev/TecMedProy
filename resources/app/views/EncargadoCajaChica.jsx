import { useNavigate } from "react-router-dom";
import Encabezado from "../components/Encabezado";
import useSWR from "swr";
import clienteAxios from "../config/axios";
import useProyect from "../hooks/useProyect";
import Cargando from "../components/Cargando";
import Swal from "sweetalert2";

export default function EncargadoCajaChica() {

  const { elegirResponsable, idMoneyBox } = useProyect();

  const token = localStorage.getItem('AUTH_TOKEN')

  const fetcher = () => clienteAxios('/api/managers', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(data => data.data)

  const { data, error, isLoading } = useSWR('/api/managers', fetcher, {
    revalidateOnFocus: true,
    revalidateIfStale: false,
    revalidateOnReconnect: false
  })

  if (isLoading) return <div className="h-32"><Cargando /></div>

  const encargados = data.data

  const handleSubmit = (nombre, id) => {
    Swal.fire({
      title: nombre,
      text: "Sera el nuevo responsable de la caja chica, esta seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, confirmar"
    }).then((result) => {
      if (result.isConfirmed) {
        const datos = {
          user_id: id,
          id: idMoneyBox || '1'
        }
        const mostrarRespuesta = async () => {
          const respuesta = await elegirResponsable(datos);
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
      <div className="relative overflow-x-auto pt-5">
        <table className="w-4/5 text-sm text-center mx-auto">
          <thead className="text-sm uppercase bg-gray-600 text-white">
            <tr>
              <th scope="col" className="p-2">
                Nombre Completo
              </th>
              <th scope="col" className="p-2">
                Correo electronico
              </th>
              <th scope="col" className="p-2">
                Perfil
              </th>
              <th scope="col" className="p-2">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {
              encargados?.map(encargado => (
                <tr className="bg-white border-b" key={encargado.id}>
                  <th scope="row" className="p-2 font-medium">
                    {encargado.nombreCompleto}
                  </th>
                  <th scope="row" className="p-2 font-medium">
                    {encargado.email}
                  </th>
                  <th scope="row" className="p-2 font-medium">
                    <div className="flex items-center justify-center">
                      <img
                        className="w-16 h-16 rounded-full"
                        src={encargado.imagen}
                      />
                    </div>
                  </th>
                  <td className="p-2">
                    <button type="button" className="bg-cyan-900 hover:bg-cyan-950 text-white p-4 rounded-lg font-bold" onClick={() => {
                      handleSubmit(encargado.nombreCompleto, encargado.id)
                    }}>Elegir encargado</button>
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
