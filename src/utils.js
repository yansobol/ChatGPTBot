import {unlink} from 'fs/promises'

export const removeFile = async (path) =>{
    try {
        await unlink(path)
    } catch (error) {
        console.log(`Error while deleting file from: ${path}. Message: ${error.message}`)
    }
}