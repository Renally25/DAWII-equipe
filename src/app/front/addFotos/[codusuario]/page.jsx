"use client";

import styles from "./page.module.css";
import Sidebar from "../../sidebar/sidebar";
import { profiles } from "../../sidebar/profiles";
import Top from "../../top/top";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "@deemlol/next-icons";

export default function AddFotos() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = params.codusuario;

  const [dataAvaliacao, setDataAvaliacao] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Estado para armazenar os uploads de imagens
  const [fotos, setFotos] = useState({
    frente: null,
    costas: null,
    perfilDireito: null,
    perfilEsquerdo: null,
  });

  const [previews, setPreviews] = useState({
    frente: null,
    costas: null,
    perfilDireito: null,
    perfilEsquerdo: null,
  });

  // Estado para armazenar todas as medidas antropométricas do DER
  const [medidas, setMedidas] = useState({
    pescoco: "",
    ombro: "",
    torax: "",
    cintura: "",
    abdomen: "",
    quadril: "",
    bracoEsquerdoLx: "",
    bracoEsquerdoCtr: "",
    antbracoEsquerdo: "",
    bracoDireitoLx: "",
    bracoDireitoCtr: "",
    antbracoDireito: "",
    coxaEsquerdaProx: "",
    coxaEsquerdaMedial: "",
    coxaEsquerdaDistal: "",
    pantEsquerda: "",
    coxaDireitaProx: "",
    coxaDireitaMedial: "",
    coxaDireitaDistal: "",
    pantuDireita: "",
  });
  const handleFotoChange = (angulo, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione uma imagem válida.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setFotos((prev) => ({
      ...prev,
      [angulo]: file,
    }));

    setPreviews((prev) => ({
      ...prev,
      [angulo]: URL.createObjectURL(file),
    }));
  };
  useEffect(() => {
    async function buscarFotos() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/FotoCorpo_Aluno?codusuario=${pacienteId}`,
        );

        const texto = await response.text();

        console.log("Status:", response.status);
        console.log("Resposta:", texto);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${texto}`);
        }

        const fotosBanco = JSON.parse(texto);

        const novasPreviews = {
          frente: null,
          costas: null,
          perfilDireito: null,
          perfilEsquerdo: null,
        };

        fotosBanco.forEach((item) => {
          if (item.angulo in novasPreviews) {
            novasPreviews[item.angulo] = item.foto;
          }
        });

        setPreviews(novasPreviews);
      } catch (error) {
        console.error("Erro ao buscar fotos:", error);
      }
    }

    if (pacienteId) {
      buscarFotos();
    }
  }, [pacienteId]);
  const handleMedidaChange = (e) => {
    const { name, value } = e.target;
    setMedidas((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //SALVAR AS FOTOS

      for (const [angulo, arquivo] of Object.entries(fotos)) {
        if (!arquivo) continue;

        const formData = new FormData();

        formData.append("codusuario", pacienteId);
        formData.append("angulo", angulo);
        formData.append("foto", arquivo);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API}/api/FotoCorpo_Aluno`,
          {
            method: "POST",
            body: formData,
          },
        );

        const resultado = await response.json();

        if (!response.ok) {
          throw new Error(
            resultado.error || `Erro ao salvar a foto ${angulo}.`,
          );
        }

        console.log(`Foto ${angulo} salva:`, resultado);
      }
      //SALVAR A AVALIAÇÃO

      const payload = {
        codusuario: pacienteId,
        dataAvaliacao,
        medidas,
      };

      console.log("Enviando Dados da Avaliação:", payload);

      const avaliacaoResponse = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/api/AvaliacaoAntropometrica`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const avaliacaoTexto = await avaliacaoResponse.text();

      let avaliacaoResultado;

      try {
        avaliacaoResultado = JSON.parse(avaliacaoTexto);
      } catch {
        throw new Error(
          "A API da avaliação não retornou uma resposta JSON válida.",
        );
      }

      if (!avaliacaoResponse.ok) {
        throw new Error(
          avaliacaoResultado.error ||
            "Erro ao salvar avaliação antropométrica.",
        );
      }

      console.log("✅ Avaliação salva:", avaliacaoResultado);

      alert("Avaliação antropométrica e fotos gravadas com sucesso!");

      router.push(`/front/pacientesTreinador`);
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);

      alert(error.message || "Erro ao salvar avaliação.");
    }
  };

  const angulosFotos = [
    { key: "frente", label: "Frente" },
    { key: "costas", label: "Costas" },
    { key: "perfilDireito", label: "Perfil Direito" },
    { key: "perfilEsquerdo", label: "Perfil Esquerdo" },
  ];

  return (
    <div className={styles.dashboard}>
      <Sidebar profile={profiles.treinador} />

      <div>
        <Top />

        <div className={styles.container}>
          <div className={styles.header}>
            <button className={styles.btnVoltar} onClick={() => router.back()}>
              <ArrowLeft size={40} color="#050505" strokeWidth={2} />
            </button>
            <h2>Avaliação Antropométrica e Fotos</h2>
          </div>
          <p className={styles.subtitulo}>Paciente ID:{pacienteId}</p>

          <form onSubmit={handleSubmit} className={styles.formAvaliacao}>
            <div className={styles.campoData}>
              <label htmlFor="dataAvaliacao">Data da Avaliação:</label>
              <input
                type="date"
                id="dataAvaliacao"
                value={dataAvaliacao}
                onChange={(e) => setDataAvaliacao(e.target.value)}
                required
              />
            </div>

            {/*REGISTRO FOTOGRÁFICO */}
            <section className={styles.secao}>
              <h3 className={styles.tituloSecao}>1. Registro Fotográfico</h3>
              <div className={styles.gridFotos}>
                {angulosFotos.map((angulo) => (
                  <div key={angulo.key} className={styles.cardFoto}>
                    <h4>{angulo.label}</h4>
                    <div className={styles.areaPreview}>
                      {previews[angulo.key] ? (
                        <img
                          src={previews[angulo.key]}
                          alt={`Preview ${angulo.label}`}
                          className={styles.imagemPreview}
                        />
                      ) : (
                        <span className={styles.placeholder}>Nenhuma foto</span>
                      )}
                    </div>
                    <label className={styles.btnUpload}>
                      {previews[angulo.key] ? "Alterar" : "Selecionar"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFotoChange(angulo.key, e.target.files[0])
                        }
                        hidden
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {/*  MEDIDAS CORPORAIS */}
            <section className={styles.secao}>
              <h3 className={styles.tituloSecao}>
                2. Circunferências e Medidas (cm)
              </h3>

              <div className={styles.gridMedidas}>
                {/* Tronco & Pescoço */}
                <div className={styles.cardMedida}>
                  <h4>Tronco e Pescoço</h4>
                  <div className={styles.grupoInput}>
                    <label>Pescoço</label>
                    <input
                      type="number"
                      step="0.1"
                      name="pescoco"
                      placeholder="0.0 cm"
                      value={medidas.pescoco}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Ombro</label>
                    <input
                      type="number"
                      step="0.1"
                      name="ombro"
                      placeholder="0.0 cm"
                      value={medidas.ombro}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Tórax</label>
                    <input
                      type="number"
                      step="0.1"
                      name="torax"
                      placeholder="0.0 cm"
                      value={medidas.torax}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Cintura</label>
                    <input
                      type="number"
                      step="0.1"
                      name="cintura"
                      placeholder="0.0 cm"
                      value={medidas.cintura}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Sêmen / Abdômen</label>
                    <input
                      type="number"
                      step="0.1"
                      name="abdomen"
                      placeholder="0.0 cm"
                      value={medidas.abdomen}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Quadril</label>
                    <input
                      type="number"
                      step="0.1"
                      name="quadril"
                      placeholder="0.0 cm"
                      value={medidas.quadril}
                      onChange={handleMedidaChange}
                    />
                  </div>
                </div>

                {/* Membros Superiores Esquerdos */}
                <div className={styles.cardMedida}>
                  <h4>Membros Superiores Esquerdos</h4>
                  <div className={styles.grupoInput}>
                    <label>Braço Esq. Relaxado (bracoesquerdorlx)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="bracoEsquerdoLx"
                      placeholder="0.0 cm"
                      value={medidas.bracoEsquerdoLx}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Braço Esq. Contraído (bracoesquerdoctr)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="bracoEsquerdoCtr"
                      placeholder="0.0 cm"
                      value={medidas.bracoEsquerdoCtr}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Antebraço Esquerdo</label>
                    <input
                      type="number"
                      step="0.1"
                      name="antbracoEsquerdo"
                      placeholder="0.0 cm"
                      value={medidas.antbracoEsquerdo}
                      onChange={handleMedidaChange}
                    />
                  </div>
                </div>

                {/* Membros Superiores Direitos */}
                <div className={styles.cardMedida}>
                  <h4>Membros Superiores Direitos</h4>
                  <div className={styles.grupoInput}>
                    <label>Braço Dir. Relaxado (bracodireitorlx)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="bracoDireitoLx"
                      placeholder="0.0 cm"
                      value={medidas.bracoDireitoLx}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Braço Dir. Contraído (bracodireitoctr)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="bracoDireitoCtr"
                      placeholder="0.0 cm"
                      value={medidas.bracoDireitoCtr}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Antebraço Direito</label>
                    <input
                      type="number"
                      step="0.1"
                      name="antbracoDireito"
                      placeholder="0.0 cm"
                      value={medidas.antbracoDireito}
                      onChange={handleMedidaChange}
                    />
                  </div>
                </div>

                {/* Membros Inferiores Esquerdos */}
                <div className={styles.cardMedida}>
                  <h4>Membros Inferiores Esquerdos</h4>
                  <div className={styles.grupoInput}>
                    <label>Coxa Esq. Proximal</label>
                    <input
                      type="number"
                      step="0.1"
                      name="coxaEsquerdaProx"
                      placeholder="0.0 cm"
                      value={medidas.coxaEsquerdaProx}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Coxa Esq. Medial</label>
                    <input
                      type="number"
                      step="0.1"
                      name="coxaEsquerdaMedial"
                      placeholder="0.0 cm"
                      value={medidas.coxaEsquerdaMedial}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Coxa Esq. Distal</label>
                    <input
                      type="number"
                      step="0.1"
                      name="coxaEsquerdaDistal"
                      placeholder="0.0 cm"
                      value={medidas.coxaEsquerdaDistal}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Panturrilha Esquerda</label>
                    <input
                      type="number"
                      step="0.1"
                      name="pantEsquerda"
                      placeholder="0.0 cm"
                      value={medidas.pantEsquerda}
                      onChange={handleMedidaChange}
                    />
                  </div>
                </div>

                {/* Membros Inferiores Direitos */}
                <div className={styles.cardMedida}>
                  <h4>Membros Inferiores Direitos</h4>
                  <div className={styles.grupoInput}>
                    <label>Coxa Dir. Proximal</label>
                    <input
                      type="number"
                      step="0.1"
                      name="coxaDireitaProx"
                      placeholder="0.0 cm"
                      value={medidas.coxaDireitaProx}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Coxa Dir. Medial</label>
                    <input
                      type="number"
                      step="0.1"
                      name="coxaDireitaMedial"
                      placeholder="0.0 cm"
                      value={medidas.coxaDireitaMedial}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Coxa Dir. Distal</label>
                    <input
                      type="number"
                      step="0.1"
                      name="coxaDireitaDistal"
                      placeholder="0.0 cm"
                      value={medidas.coxaDireitaDistal}
                      onChange={handleMedidaChange}
                    />
                  </div>
                  <div className={styles.grupoInput}>
                    <label>Panturrilha Direita (pantuDireita)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="pantuDireita"
                      placeholder="0.0 cm"
                      value={medidas.pantuDireita}
                      onChange={handleMedidaChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className={styles.acoes}>
              <button type="submit" className={styles.btnSalvar}>
                Salvar Avaliação
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
