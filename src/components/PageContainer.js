import React from 'react';
import { Editor, EditorState, RichUtils, Modifier ,convertFromRaw,convertToRaw} from 'draft-js';
import './PageContainer.css';

const styleMap = {
  COLOR_RED: {
    color: 'red',
  },
};

class PageContainer extends React.Component {
    constructor(props) {
        super(props);
        const storedContent = localStorage.getItem('editorContent');
        console.log(storedContent);
        if (storedContent){
            const contentState = convertFromRaw(JSON.parse(storedContent));
            this.state = {
                editorState: EditorState.createWithContent(contentState),
            };
        }
        else{
            this.state = {
                editorState: EditorState.createEmpty(),
              };
        }

        
      }
    

  onChange = (newEditorState) => {
    this.setState({
      editorState: newEditorState,
    });
  };

  handleBeforeInput = (char) => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const startOffset = selection.getStartOffset();
    const blockKey = selection.getStartKey();
    const currentBlock = contentState.getBlockForKey(blockKey);
    const blockText = currentBlock.getText();

    const sanitizedChar = char === '#' || char === '*' ? '' : char;

    const charSequence =
      contentState.getBlockForKey(selection.getStartKey()).getText().slice(0, startOffset) + sanitizedChar;

    if (charSequence.endsWith('# ')) {
      const modifiedText = blockText.substring(2);
      const newContentState = Modifier.replaceText(contentState, selection.merge({ anchorOffset: 0 }), modifiedText);
      const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
      const newEditorStateWithHeading = RichUtils.toggleBlockType(newEditorState, 'header-one');
      this.onChange(newEditorStateWithHeading);
      return 'handled';
    } else if (charSequence.endsWith('*** ')) {
      const modifiedText = blockText.substring(3);
      const newContentState = Modifier.replaceText(contentState, selection.merge({ anchorOffset: 0 }), modifiedText);
      const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
      const newEditorStateWithUnderline = RichUtils.toggleInlineStyle(newEditorState, 'UNDERLINE');
      this.onChange(newEditorStateWithUnderline);
      return 'handled';
    } else if (charSequence.endsWith('** ')) {
      const modifiedText = blockText.substring(2);
      const newContentState = Modifier.replaceText(contentState, selection.merge({ anchorOffset: 0 }), modifiedText);
      const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
      const newEditorStateWithColor = RichUtils.toggleInlineStyle(newEditorState, 'COLOR_RED');
      this.onChange(newEditorStateWithColor);
      return 'handled';
    } else if (charSequence.endsWith('* ')) {
      const modifiedText = blockText.substring(1);
      const newContentState = Modifier.replaceText(contentState, selection.merge({ anchorOffset: 0 }), modifiedText);
      const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
      const newEditorStateWithBold = RichUtils.toggleInlineStyle(newEditorState, 'BOLD');
      this.onChange(newEditorStateWithBold);
      return 'handled';
    }

    return 'not-handled';
  };

  handleSave = () => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const contentToSave = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem('editorContent', contentToSave);
    alert('Editor content saved!');
};


  render() {
    return (
      <div className='bg-container'>
        <div className='above-container'>
           
        <h1 className='heading'>Text Editor</h1>
        <button className='save-button' onClick={this.handleSave}>Save</button>
        </div>
        <div className="editorContainer">
          <Editor
            editorState={this.state.editorState}
            handleBeforeInput={this.handleBeforeInput}
            onChange={this.onChange}
            customStyleMap={styleMap}
          />
        </div>
      </div>
    );
  }
}

export default PageContainer;
