"use client";

import React from "react";

import lottieJson from "../../assets/animate-photo.json";
import {
  CenteredLottie,
  DownloadQuoteCardContainer,
  DownloadQuoteCardContainerText,
} from "./AnimationStyled";

interface AnimatedDownloadButtonProps {
  handleDownload: () => void;
}

const AnimatedDownloadButton = ({
  handleDownload,
}: AnimatedDownloadButtonProps) => {
  return (
    <DownloadQuoteCardContainer onClick={handleDownload}>
      <CenteredLottie loop animationData={lottieJson} play />
      <DownloadQuoteCardContainerText>
        Downlad generated quote card
      </DownloadQuoteCardContainerText>
    </DownloadQuoteCardContainer>
  );
};

export default AnimatedDownloadButton;
