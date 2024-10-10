<?php

namespace App\Http\Controllers;

use App\Events\NewResponseEvent;
use App\Http\Resources\OrderCollection;
use App\Http\Resources\OrderResource;
use App\Models\Material;
use App\Models\Order;
use App\Models\OrderMaterial;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $errores = [];
            foreach ($request->pedido as $material) {
                $materialEditar = Material::find($material['id']);
                if ($materialEditar->cantidad_utilizada < $material['cantidad']) {
                    $errores[] = 'La cantidad solicitada es mayor a la disponible '.$materialEditar->nombre. ' cantidad disponible: '.$materialEditar->cantidad_utilizada.' cantidad pedida '.$material['cantidad'];
                }
            }

            if (count($errores)>0) {
                return response([
                    'errors' => $errores
                ], 422);
            }
            //Almacenar una prestamo
            $order = Order::create([
                "user_id" => $request->usuarioId,
                "teacher_id" => $request->docenteId,
                "subject_id" => $request->materiaId,
                "estado" => "Sin habilitar"
            ]);

            foreach ($request->pedido as $material) {
                OrderMaterial::create([
                    'order_id' => $order->id,
                    'material_id' => $material['id'],
                    'cantidad' => $material['cantidad']
                ]);
                $materialEditar = Material::find($material['id']);
                $materialEditar->cantidad_utilizada = $materialEditar->cantidad_utilizada - $material['cantidad'];
                $materialEditar->update();
            }

            DB::commit();
            $user = User::find($request->usuarioId);
            event(new NewResponseEvent($user->tipo));
            return [
                'message' => 'Pedido realizado con exito, dirigase a dirección'
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            return response([
                'errors' => ['Ocurrio algo inesperado con el servidor: '.$e->getMessage()]
            ], 422);
        }
    }

    public function getOrders()
    {
        return new OrderCollection(Order::with('user')->with('teacher')->with('subject')->with('materials')->orderByDesc('created_at')->get());
    }

    public function getOrderId($id)
    {
        return new OrderResource(Order::with('user.student.mention')->with('teacher')->with('subject')->with('materials')->find($id));
    }

    public function confirmOrder(Request $request)
    {
        $order = Order::find($request->idPedido);

        if ($order->estado == 'En curso') {
            $order->estado = 'Finalizado';
            $order->descripcion = $request->descripcion;
            $order->save();
            foreach ($request->materiales as $material) {
                $materialDataBase = Material::find($material['id']);
                $materialDataBase->cantidad_utilizada = $materialDataBase->cantidad_utilizada + $material['cantidad'];
                $materialDataBase->save();
            }
            return [
                'message' => 'Pedido finalizado'
            ];
        } else {
            $order->descripcion = $request->descripcion;
            $order->estado = 'En curso';

            $order->save();

            return [
                'message' => 'Pedido confirmado'
            ];
        }
    }

    public function deleteOrder($id)
    {

        $order = Order::where('id',$id)->with('materials')->first();
        foreach ($order->materials as $material) {
            $materialDataBase = Material::find($material['id']);
            if ($order->estado !== 'Finalizado') {
                $materialDataBase->cantidad_utilizada += $material->pivot->cantidad;
                $materialDataBase->save();
            }
        }

        $order->delete();

        return [
            "message" => "Prestamo eliminado con exito"
        ];
    }
}
