"use client";
import React, { useState, useEffect } from "react";
import { Modal, Backdrop, Fade } from "@mui/material";
import {
  ModalCircularProgress,
  QuoteGeneratorModalContainer,
  QuoteGeneratorModalInnerContainer,
  QuoteGeneratorSubTitle,
  QuoteGeneratorTitle,
} from "./QuoteGeneratorStyled";
import { ImageBlobContainer } from "../animations/AnimationStyled";
import ImageBlob from "../animations/ImageBlob";
import AnimatedDownloadButton from "../animations/AnimatedDownloadButton";

interface QuoteGeneratorModalProps {
  open: boolean;
  close: () => void;
  processingQuote: boolean;
  setProcessingQuote: React.Dispatch<React.SetStateAction<boolean>>;
  quoteReceived: String | null;
  setQuoteReceived: React.Dispatch<React.SetStateAction<String | null>>;
}

const style = {};

const QuoteGeneratorModal = ({
  open,
  close,
  processingQuote,
  quoteReceived,
}: QuoteGeneratorModalProps) => {
  const wiseDevQuote = "center a div? anythings possible!";
  const wiseDevQuoteAuthor = "Senior-senior software engineer";

  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  //function to handle download of quote card

  const handleDownload = () => {
    const link = document.createElement("a");
    if (typeof blobUrl === "string") {
      link.href = blobUrl;
      link.download = "quote.png";
      link.click();
    }
  };

  //function to handle receiving of quote card (after you get string back form lambda)

  useEffect(() => {
    if (quoteReceived) {
      const binaryData = Buffer.from(quoteReceived, "base64");
      const blob = new Blob([binaryData], { type: "image/png" });
      const blobUrlGenerated = URL.createObjectURL(blob);
      console.log(blobUrlGenerated);
      setBlobUrl(blobUrlGenerated);

      return () => {
        URL.revokeObjectURL(blobUrlGenerated);
      };
    }
  }, [quoteReceived]);

  return (
    <Modal
      id="QuoteGeneratorModal"
      aria-labelledby="spring-modal-quotegeneratormodal"
      aria-describedby="spring-modal-opens-and-closes-quote-generator"
      open={open}
      onClose={close}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <QuoteGeneratorModalContainer sx={style}>
          <QuoteGeneratorModalInnerContainer>
            {/* State 1: processing request of quote + quote state is empty */}

            {processingQuote === true && quoteReceived === null && (
              <>
                <ModalCircularProgress size={"8rem"} thickness={2.5} />

                <QuoteGeneratorTitle>
                  Creating your quote...
                </QuoteGeneratorTitle>

                <QuoteGeneratorSubTitle style={{ marginTop: "20px" }}>
                  {wiseDevQuote}
                  <br></br>
                  <span style={{ fontSize: 26 }}>{wiseDevQuoteAuthor}</span>
                </QuoteGeneratorSubTitle>
              </>
            )}

            {/* state 2; quote state received */}
            {quoteReceived !== null && (
              <>
                <QuoteGeneratorTitle>Download a quote!</QuoteGeneratorTitle>
                <QuoteGeneratorSubTitle style={{ marginTop: "20px" }}>
                  See preview:
                </QuoteGeneratorSubTitle>
                <ImageBlobContainer>
                  <ImageBlob quoteReceived={quoteReceived} blobUrl={blobUrl} />
                </ImageBlobContainer>
                <AnimatedDownloadButton handleDownload={handleDownload} />
              </>
            )}
          </QuoteGeneratorModalInnerContainer>
        </QuoteGeneratorModalContainer>
      </Fade>
    </Modal>
  );
};

export default QuoteGeneratorModal;
