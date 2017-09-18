/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {DATParser} from './dat-parser'

class Fallout1DATEditor extends ArchiveFileEditor(DATParser) {
}
Serializable.includeInto(Fallout1DATEditor, __filename)

export default Fallout1DATEditor
