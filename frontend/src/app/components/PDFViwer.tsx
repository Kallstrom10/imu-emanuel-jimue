"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
} from "lucide-react";

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Carregar script do PDF.js e o documento
  useEffect(() => {
    let isMounted = true;

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;

    script.onload = () => {
      const pdfjsLib = (window as any)["pdfjs-dist/build/pdf"];
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      pdfjsLib
        .getDocument(url)
        .promise.then((pdf: any) => {
          if (isMounted) {
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            setIsLoading(false);
          }
        })
        .catch((err: any) => {
          console.error("Erro ao carregar PDF:", err);
          if (isMounted) {
            setHasError(true);
            setIsLoading(false);
          }
        });
    };

    document.body.appendChild(script);

    return () => {
      isMounted = false;
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [url]);

  // Função para renderizar a página ajustada ao container
  const renderPage = useCallback(() => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    pdfDoc.getPage(pageNum).then((page: any) => {
      const canvas = canvasRef.current!;
      const container = containerRef.current!;
      const context = canvas.getContext("2d");

      if (!context) return;

      const unscaledViewport = page.getViewport({ scale: 1 });

      // Dimensões disponíveis na área de visualização
      const padding = 32;
      const containerWidth = Math.max(container.clientWidth - padding, 200);
      const containerHeight = Math.max(container.clientHeight - padding, 200);

      // Calcula a escala para encaixar TANTO em largura como em altura
      const widthScale = containerWidth / unscaledViewport.width;
      const heightScale = containerHeight / unscaledViewport.height;

      // Escolhe o menor fator para garantir que o PDF nunca seja cortado
      const baseScale = Math.min(widthScale, heightScale);
      const finalScale = baseScale * zoomScale;

      const viewport = page.getViewport({ scale: finalScale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      page.render({
        canvasContext: context,
        viewport: viewport,
      });
    });
  }, [pdfDoc, pageNum, zoomScale]);

  // Renderizar quando mudar de página, documento ou nível de zoom
  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Recalcular dimensão ao redimensionar a janela do navegador
  useEffect(() => {
    const handleResize = () => {
      renderPage();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
        <Loader2 className="animate-spin text-red-600" size={32} />
        <span className="text-xs font-medium">A carregar documento...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-xs px-4 text-center">
        Não foi possível carregar o livro neste ecrã. Tente abrir no separador externo.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between h-full w-full bg-slate-950 overflow-hidden select-none">
      {/* Container Principal com Scroll para Zooms Maiores */}
      <div
        ref={containerRef}
        className="flex-1 w-full flex items-center justify-center overflow-auto p-3"
      >
        <canvas
          ref={canvasRef}
          className="rounded-xl shadow-2xl my-auto max-w-none"
        />
      </div>

      {/* Barra de Controlo Universal (PC & Telemóvel) */}
      <div className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 my-2 rounded-2xl text-white text-xs shadow-xl max-w-lg w-[92%] sm:w-auto shrink-0 z-10">
        {/* Controlo de Páginas */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            disabled={pageNum <= 1}
            onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}
            className="p-1.5 disabled:opacity-30 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="font-bold text-slate-200 min-w-[65px] text-center text-xs">
            {pageNum} / {numPages}
          </span>

          <button
            type="button"
            disabled={pageNum >= numPages}
            onClick={() => setPageNum((prev) => Math.min(prev + 1, numPages))}
            className="p-1.5 disabled:opacity-30 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Próxima página"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-800" />

        {/* Controlo de Zoom */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.max(prev - 0.2, 0.6))}
            className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-slate-300"
            title="Reduzir zoom"
          >
            <ZoomOut size={18} />
          </button>

          <button
            type="button"
            onClick={() => setZoomScale(1)}
            className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-slate-300"
            title="Ajustar ao ecrã"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.min(prev + 0.2, 2.5))}
            className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-slate-300"
            title="Aumentar zoom"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}