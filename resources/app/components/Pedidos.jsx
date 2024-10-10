
import { useState } from 'react';
import { mutate } from 'swr';
import useProyect from '../hooks/useProyect'
import Pedido from './Pedido';
import Alerta from './Alerta';
import { useNavigate } from 'react-router-dom';
import Cargando from "./Cargando";

export default function Pedidos({ docente, setDocente, materia, setMateria }) {

    const { menuMateriales, pedido, realizarPedido, usuarioLogin, changeViewMenu, cargando } = useProyect();
    const navigate = useNavigate()
    const [errores, setErrores] = useState([]);
    let erroresEncontrados = [];
    const handleSubmit = async () => {
        erroresEncontrados = [];
        if (pedido.length === 0) {
            erroresEncontrados.push('Tiene que existir al menos un material para realizar el prestamo')
        }

        if (docente === '' || docente === undefined) {
            erroresEncontrados.push('El docente es obligatorio')
        }

        if (materia === '' || materia === undefined) {
            erroresEncontrados.push('La materia es obligatoria')
        }
        setErrores(erroresEncontrados)
        if (erroresEncontrados.length === 0) {
            const pedidoEnviar = {
                pedido,
                usuarioId: usuarioLogin.id,
                docenteId: docente.id,
                materiaId: materia.id
            }
            let resultado = false;
            resultado = await realizarPedido(pedidoEnviar, setErrores)
            if (resultado) {
                changeViewMenu();
                setMateria('')
                setDocente('')
                if (usuarioLogin.tipo === 'administrativo') {
                    navigate('/administrativo/materiales')
                }
            }
        }
    }
    return (
        <div className={`h-screen sm:w-80 w-full bg-gray-100 fixed top-0 right-0 p-6 ${menuMateriales ? 'opacity-100 z-10' : 'opacity-0 -z-10'} transition duration-500 overflow-y-scroll`}>
            <div className='flex justify-center items-center'>
                <button
                    className='absolute bg-blue-950 text-center text-white font-black p-1 rounded-full mb-1 right-0 mt-2'
                    onClick={() => {
                        changeViewMenu()
                        setErrores([])
                    }}
                ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </button>
            </div>

            <h2 className='text-center font-black text-3xl text-blue-950'>Materiales pedidos</h2>
            {errores.length > 0 ? errores.map((error, i) => <Alerta key={i}>{error}</Alerta>) : null}
            <p className='mt-3'>Aqui podrás ver el resumen de lo materiales que solicitaste.</p>
            {
                pedido.map(material => (
                    <Pedido
                        key={material.id}
                        nombre={material.nombre}
                        cantidad={material.cantidad}
                        id={material.id}
                    />
                ))
            }
            <p className='mt-3'>Docente: <span className='font-bold'>{docente?.nombreCompleto}</span></p>
            <p className='my-3'>Materia: <span className='font-bold'>{materia?.nombre}</span></p>
            <button type="button" className='flex justify-center gap-1 font-black bg-blue-600 hover:bg-blue-700 text-white w-full p-2 rounded-lg' onClick={handleSubmit} disabled={cargando}>Realizar pedido {cargando && <div className='w-8'> <Cargando /></div>}</button>
        </div>
    )
}