/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {DATParser} from './dat-parser'

class Fallout2DATEditor extends ArchiveFileEditor(DATParser) {
}
Serializable.includeInto(Fallout2DATEditor, __filename)

export default Fallout2DATEditor
