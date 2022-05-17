import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import './Swagger.css';

export default function Swagger() {
  return (
    <div id="swagger-container" className="default-scroll-color">
      <SwaggerUI url={`${process.env.PUBLIC_URL}/docs/api.yml`} />
    </div>
  );
}
