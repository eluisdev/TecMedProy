<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('correspondences', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->date('fechaCreacion');
            $table->string('identificador');
            $table->string('descripcion',500);
            $table->string('estado');
            $table->string('estadoAnterior')->nullable();
            $table->string('documento_inicial')->nullable();
            $table->string('receptor')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('correspondences');
    }
};
