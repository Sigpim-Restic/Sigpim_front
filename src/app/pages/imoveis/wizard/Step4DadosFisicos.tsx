import React, { useState, useMemo } from "react";
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
import { Textarea } from "../../../components/ui/textarea";
import { PropertyMap, Coordinate } from "../../../components/ui/property-map";
import { AlertBox } from "../../../components/layout/States";
import { MapPin } from "lucide-react";

export function CadastroImovelStep4() {
  const [formData, setFormData] = useState({
    areaTerreno: "",
    areaConstruida: "",
    areaUtil: "",
    frente: "",
    fundo: "",
    lateral1: "",
    lateral2: "",
    diagonal: "",
    topografia: "",
    formatoTerreno: "",
    pavimentos: "",
    estadoConservacao: "",
    infraestrutura: "",
    p001Lat: "",
    p001Lng: "",
    p002Lat: "",
    p002Lng: "",
    p003Lat: "",
    p003Lng: "",
    p004Lat: "",
    p004Lng: "",
    p005Lat: "",
    p005Lng: "",
  });

  const coordinates: Coordinate[] = useMemo(() => {
    const points = [
      { lat: formData.p001Lat, lng: formData.p001Lng },
      { lat: formData.p002Lat, lng: formData.p002Lng },
      { lat: formData.p003Lat, lng: formData.p003Lng },
      { lat: formData.p004Lat, lng: formData.p004Lng },
      { lat: formData.p005Lat, lng: formData.p005Lng },
    ];

    // Filtrar apenas pontos com coordenadas válidas
    return points
      .filter((p) => p.lat && p.lng)
      .map((p) => ({
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng),
      }))
      .filter((p) => !isNaN(p.lat) && !isNaN(p.lng));
  }, [
    formData.p001Lat,
    formData.p001Lng,
    formData.p002Lat,
    formData.p002Lng,
    formData.p003Lat,
    formData.p003Lng,
    formData.p004Lat,
    formData.p004Lng,
    formData.p005Lat,
    formData.p005Lng,
  ]);

  return (
    <WizardLayout currentStep={4}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Dados Físicos
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Dimensões, áreas e características físicas do imóvel
          </p>
        </div>

        <div className="grid gap-6">
          {/* Áreas */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Áreas (em m²)
            </h4>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="areaTerreno">
                  Área do Terreno <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="areaTerreno"
                  type="number"
                  step="0.01"
                  value={formData.areaTerreno}
                  onChange={(e) =>
                    setFormData({ ...formData, areaTerreno: e.target.value })
                  }
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaConstruida">Área Construída</Label>
                <Input
                  id="areaConstruida"
                  type="number"
                  step="0.01"
                  value={formData.areaConstruida}
                  onChange={(e) =>
                    setFormData({ ...formData, areaConstruida: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaUtil">Área Útil</Label>
                <Input
                  id="areaUtil"
                  type="number"
                  step="0.01"
                  value={formData.areaUtil}
                  onChange={(e) =>
                    setFormData({ ...formData, areaUtil: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Dimensões do Terreno */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Dimensões do Terreno (em metros)
            </h4>
            <div className="grid gap-6 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="frente">Frente</Label>
                <Input
                  id="frente"
                  type="number"
                  step="0.01"
                  value={formData.frente}
                  onChange={(e) =>
                    setFormData({ ...formData, frente: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundo">Fundo</Label>
                <Input
                  id="fundo"
                  type="number"
                  step="0.01"
                  value={formData.fundo}
                  onChange={(e) =>
                    setFormData({ ...formData, fundo: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lateral1">Lateral 1</Label>
                <Input
                  id="lateral1"
                  type="number"
                  step="0.01"
                  value={formData.lateral1}
                  onChange={(e) =>
                    setFormData({ ...formData, lateral1: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lateral2">Lateral 2</Label>
                <Input
                  id="lateral2"
                  type="number"
                  step="0.01"
                  value={formData.lateral2}
                  onChange={(e) =>
                    setFormData({ ...formData, lateral2: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagonal">Diagonal</Label>
                <Input
                  id="diagonal"
                  type="number"
                  step="0.01"
                  value={formData.diagonal}
                  onChange={(e) =>
                    setFormData({ ...formData, diagonal: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topografia">Topografia</Label>
              <Select
                value={formData.topografia}
                onValueChange={(value) =>
                  setFormData({ ...formData, topografia: value })
                }
              >
                <SelectTrigger id="topografia">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plano">Plano</SelectItem>
                  <SelectItem value="aclive">Aclive</SelectItem>
                  <SelectItem value="declive">Declive</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formatoTerreno">Formato do Terreno</Label>
              <Select
                value={formData.formatoTerreno}
                onValueChange={(value) =>
                  setFormData({ ...formData, formatoTerreno: value })
                }
              >
                <SelectTrigger id="formatoTerreno">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                  <SelectItem value="esquina">Esquina</SelectItem>
                  <SelectItem value="encravado">Encravado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pavimentos">Número de Pavimentos</Label>
              <Input
                id="pavimentos"
                type="number"
                value={formData.pavimentos}
                onChange={(e) =>
                  setFormData({ ...formData, pavimentos: e.target.value })
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estadoConservacao">
                Estado de Conservação <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.estadoConservacao}
                onValueChange={(value) =>
                  setFormData({ ...formData, estadoConservacao: value })
                }
              >
                <SelectTrigger id="estadoConservacao">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="otimo">Ótimo</SelectItem>
                  <SelectItem value="bom">Bom</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="ruim">Ruim</SelectItem>
                  <SelectItem value="pessimo">Péssimo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Infraestrutura */}
          <div className="space-y-2">
            <Label htmlFor="infraestrutura">
              Infraestrutura Disponível
            </Label>
            <Textarea
              id="infraestrutura"
              value={formData.infraestrutura}
              onChange={(e) =>
                setFormData({ ...formData, infraestrutura: e.target.value })
              }
              placeholder="Descreva a infraestrutura: água, esgoto, energia, pavimentação, etc."
              rows={3}
            />
          </div>

          {/* Coordenadas do Terreno */}
          <div className="border-t border-gray-200 pt-6">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">
                Coordenadas do Terreno
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Coordenadas geográficas dos vértices do polígono do imóvel
              </p>
            </div>

            <div className="grid gap-4">
              {/* P001 */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 font-medium text-sm text-gray-700">
                  Ponto P001
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="p001Lat">Latitude</Label>
                    <Input
                      id="p001Lat"
                      type="text"
                      value={formData.p001Lat}
                      onChange={(e) =>
                        setFormData({ ...formData, p001Lat: e.target.value })
                      }
                      placeholder="-2.5296"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p001Lng">Longitude</Label>
                    <Input
                      id="p001Lng"
                      type="text"
                      value={formData.p001Lng}
                      onChange={(e) =>
                        setFormData({ ...formData, p001Lng: e.target.value })
                      }
                      placeholder="-44.3028"
                    />
                  </div>
                </div>
              </div>

              {/* P002 */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 font-medium text-sm text-gray-700">
                  Ponto P002
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="p002Lat">Latitude</Label>
                    <Input
                      id="p002Lat"
                      type="text"
                      value={formData.p002Lat}
                      onChange={(e) =>
                        setFormData({ ...formData, p002Lat: e.target.value })
                      }
                      placeholder="-2.5296"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p002Lng">Longitude</Label>
                    <Input
                      id="p002Lng"
                      type="text"
                      value={formData.p002Lng}
                      onChange={(e) =>
                        setFormData({ ...formData, p002Lng: e.target.value })
                      }
                      placeholder="-44.3028"
                    />
                  </div>
                </div>
              </div>

              {/* P003 */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 font-medium text-sm text-gray-700">
                  Ponto P003
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="p003Lat">Latitude</Label>
                    <Input
                      id="p003Lat"
                      type="text"
                      value={formData.p003Lat}
                      onChange={(e) =>
                        setFormData({ ...formData, p003Lat: e.target.value })
                      }
                      placeholder="-2.5296"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p003Lng">Longitude</Label>
                    <Input
                      id="p003Lng"
                      type="text"
                      value={formData.p003Lng}
                      onChange={(e) =>
                        setFormData({ ...formData, p003Lng: e.target.value })
                      }
                      placeholder="-44.3028"
                    />
                  </div>
                </div>
              </div>

              {/* P004 */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 font-medium text-sm text-gray-700">
                  Ponto P004
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="p004Lat">Latitude</Label>
                    <Input
                      id="p004Lat"
                      type="text"
                      value={formData.p004Lat}
                      onChange={(e) =>
                        setFormData({ ...formData, p004Lat: e.target.value })
                      }
                      placeholder="-2.5296"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p004Lng">Longitude</Label>
                    <Input
                      id="p004Lng"
                      type="text"
                      value={formData.p004Lng}
                      onChange={(e) =>
                        setFormData({ ...formData, p004Lng: e.target.value })
                      }
                      placeholder="-44.3028"
                    />
                  </div>
                </div>
              </div>

              {/* P005 */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 font-medium text-sm text-gray-700">
                  Ponto P005
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="p005Lat">Latitude</Label>
                    <Input
                      id="p005Lat"
                      type="text"
                      value={formData.p005Lat}
                      onChange={(e) =>
                        setFormData({ ...formData, p005Lat: e.target.value })
                      }
                      placeholder="-2.5296"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p005Lng">Longitude</Label>
                    <Input
                      id="p005Lng"
                      type="text"
                      value={formData.p005Lng}
                      onChange={(e) =>
                        setFormData({ ...formData, p005Lng: e.target.value })
                      }
                      placeholder="-44.3028"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <PropertyMap points={coordinates} />
            </div>

            <div className="mt-4">
              <AlertBox variant="info">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">
                    O mapa é atualizado automaticamente conforme você preenche as
                    coordenadas. Certifique-se de que os valores estão corretos para
                    uma visualização precisa do terreno.
                  </p>
                </div>
              </AlertBox>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}