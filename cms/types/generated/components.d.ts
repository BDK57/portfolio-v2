import type { Schema, Struct } from '@strapi/strapi';

export interface ProjectHighlight extends Struct.ComponentSchema {
  collectionName: 'components_project_highlights';
  info: {
    description: 'A feature card on the case study page';
    displayName: 'Highlight';
  };
  attributes: {
    text: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLabel extends Struct.ComponentSchema {
  collectionName: 'components_shared_labels';
  info: {
    description: 'One short line of text';
    displayName: 'Label';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'project.highlight': ProjectHighlight;
      'shared.label': SharedLabel;
    }
  }
}
