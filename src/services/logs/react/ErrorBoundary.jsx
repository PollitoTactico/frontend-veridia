import React from "react";
import { logger } from "../index";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    logger.error("React boundary error", { error: String(error), info });
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
