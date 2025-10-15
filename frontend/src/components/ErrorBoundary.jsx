
   import { Component } from 'react';

   class ErrorBoundary extends Component {
     state = { hasError: false };

     componentDidCatch(error, info) {
       console.error('ErrorBoundary caught:', error, info);
       this.setState({ hasError: true });
     }

     render() {
       if (this.state.hasError) {
         return <h1 className="text-center text-red-500">Something went wrong.</h1>;
       }
       return this.props.children;
     }
   }

   export default ErrorBoundary;
   