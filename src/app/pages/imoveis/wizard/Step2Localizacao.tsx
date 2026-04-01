import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { AlertBox } from "../../../components/layout/States";
import { MapPin } from "lucide-react";

export function CadastroImovelStep2() {
  const [formData, setFormData] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "São Luís",
    estado: "MA",
    latitude: "",
    longitude: "",
  });

  return (
    <WizardLayout currentStep={2}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Localização e GIS
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Endereço completo e coordenadas georreferenciadas do imóvel
          </p>
        </div>

        <AlertBox variant="info">
          As coordenadas GIS são essenciais para a localização precisa do
          imóvel no sistema de mapeamento. Utilize o formato decimal
          (ex: -2.5387, -44.2825).
        </AlertBox>

        <div className="grid gap-6">
          {/* CEP e Logradouro */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cep">
                CEP <span className="text-red-600">*</span>
              </Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                placeholder="65000-000"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="logradouro">
                Logradouro <span className="text-red-600">*</span>
              </Label>
              <Input
                id="logradouro"
                value={formData.logradouro}
                onChange={(e) =>
                  setFormData({ ...formData, logradouro: e.target.value })
                }
                placeholder="Ex: Rua do Sol"
                required
              />
            </div>
          </div>

          {/* Número e Complemento */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="numero">
                Número <span className="text-red-600">*</span>
              </Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) =>
                  setFormData({ ...formData, numero: e.target.value })
                }
                placeholder="Ex: 450"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.complemento}
                onChange={(e) =>
                  setFormData({ ...formData, complemento: e.target.value })
                }
                placeholder="Ex: Bloco A, Sala 201"
              />
            </div>
          </div>

          {/* Bairro, Cidade, Estado */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bairro">
                Bairro <span className="text-red-600">*</span>
              </Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) =>
                  setFormData({ ...formData, bairro: e.target.value })
                }
                placeholder="Ex: Centro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">
                Cidade <span className="text-red-600">*</span>
              </Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) =>
                  setFormData({ ...formData, cidade: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">
                Estado <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.estado}
                onValueChange={(value) =>
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MA">Maranhão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Coordenadas GIS */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#1351B4]" />
              Coordenadas Georreferenciadas
            </h4>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">
                  Latitude <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  placeholder="Ex: -2.5387"
                  required
                />
                <p className="text-xs text-gray-500">
                  Formato decimal (negativo para sul)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">
                  Longitude <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  placeholder="Ex: -44.2825"
                  required
                />
                <p className="text-xs text-gray-500">
                  Formato decimal (negativo para oeste)
                </p>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Mapa interativo de localização
              </p>
              <p className="text-xs text-gray-400">
                Clique no mapa para definir as coordenadas automaticamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
