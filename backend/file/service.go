package file

import (
	"os"
	"sync"
	"taskcaster/db"
)

func RemoveFiles(fileIds []string) error {
	if len(fileIds) == 0 {
		return nil
	}
	var wg sync.WaitGroup
	var routineErr error = nil
	sqlDelete := "DELETE FROM file WHERE id = $1"
	sqlSelect := "SELECT path FROM file WHERE id = $1"
	for _, v := range fileIds {
		wg.Add(1)
		go func() {
			var path string
			err := db.DB.QueryRow(sqlSelect, v).Scan(&path)
			if err != nil {
				routineErr = err
				wg.Done()
				return
			}
			_, err = db.DB.Exec(sqlDelete, v)
			if err != nil {
				routineErr = err
				wg.Done()
				return
			}
			err = os.Remove(path)
			if err != nil {
				routineErr = err
				wg.Done()
				return
			}
			wg.Done()
		}()
	}
	wg.Wait()
	return routineErr
}
