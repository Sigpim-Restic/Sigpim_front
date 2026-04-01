import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import { AlertBox } from "../../../components/layout/States";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";

export function CadastroImovelStep10() {
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: number; name: string; type: string; size: string }>
  >([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file, index) => ({
        id: uploadedFiles.length + index + 1,
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(2) + " KB",
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (id: number) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
  };

  const requiredDocuments = [
    "Matrícula do Imóvel",
    "Escritura ou Documento de Propriedade",
    "Planta/Croqui de Localização",
    "Registro Fotográfico do Imóvel",
    "Comprovante de IPTU",
    "Certidão Negativa de Débitos",
    "Laudo de Vistoria",
  ];

  return (
    <WizardLayout currentStep={10}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Anexos e Evidências
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload de documentos, plantas, fotos e demais evidências do imóvel
          </p>
        </div>

        <AlertBox variant="info">
          <p className="mb-2">
            Formatos aceitos: PDF, JPG, PNG, TIFF, DWG, DOC, DOCX
          </p>
          <p>Tamanho máximo por arquivo: 10 MB</p>
        </AlertBox>

        {/* Documentos Obrigatórios */}
        <div>
          <h4 className="mb-3 font-medium text-gray-900">
            Documentos Obrigatórios
          </h4>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <ul className="space-y-2">
              {requiredDocuments.map((doc, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-gray-300">
                    <span className="text-xs text-gray-600">{index + 1}</span>
                  </div>
                  <span className="text-gray-700">{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upload Area */}
        <div>
          <Label>Upload de Arquivos</Label>
          <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 hover:border-[#1351B4] hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-[#1351B4] hover:text-[#0c3b8d] focus-within:outline-none"
                >
                  <span>Clique para selecionar arquivos</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.tiff,.dwg,.doc,.docx"
                  />
                </label>
                <p className="pl-1">ou arraste e solte aqui</p>
              </div>
              <p className="text-xs leading-5 text-gray-500 mt-2">
                PDF, JPG, PNG, TIFF, DWG, DOC até 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Arquivos Anexados ({uploadedFiles.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFiles([])}
                className="text-red-600 hover:text-red-700"
              >
                Remover Todos
              </Button>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 font-semibold text-sm text-blue-900">
            Orientações para Upload
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Nomeie os arquivos de forma clara e descritiva</li>
            <li>• Documentos devem estar legíveis e completos</li>
            <li>
              • Fotos devem mostrar diferentes ângulos e detalhes do imóvel
            </li>
            <li>
              • Plantas devem estar em formato técnico adequado (DWG ou PDF)
            </li>
            <li>
              • Após finalizar o cadastro, os documentos serão armazenados com
              segurança
            </li>
          </ul>
        </div>

        {uploadedFiles.length === 0 && (
          <AlertBox variant="warning">
            Nenhum arquivo foi anexado ainda. Embora não seja obrigatório nesta
            etapa, recomendamos anexar pelo menos os documentos principais do
            imóvel.
          </AlertBox>
        )}
      </div>
    </WizardLayout>
  );
}